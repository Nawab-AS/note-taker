const { Server } = require('socket.io');
const { updateUserTokens, getUserTokens, setUserNotes, setUserTranscript } = require('./database.js');
const fs = require('fs');
const path = require('path');
const { transcribeAudio, compileNotes } = require('./openAI.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const SESSION_SECRET = process.env.SESSION_SECRET;
const TOKENS_PER_MINUTE = process.env.TOKENS_PER_MINUTE || 10;

module.exports = function(app) {
    const io = new Server(app, { cookie: true });

    io.use(async (socket, next) => { // authenticate websocket with JWT
        const rawCookies = socket.handshake.headers.cookie;
        if (!rawCookies) return next(new Error("No cookies found"));

        const cookies = Object.fromEntries(rawCookies.split('; ').map(cookie => cookie.split('=')));
        let authToken = decodeURIComponent(cookies['authToken']);
        if (!authToken) return next(new Error("No auth token found"));
        try {
            const decoded = jwt.verify(authToken, SESSION_SECRET);
            socket.username = decoded.username;
        } catch (error) {
            return next(new Error("Invalid auth token"));
        }
        next();
    });

    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('audio-blob', async (buffer) => {
            if (!(buffer instanceof Buffer)) return;
            console.log(`Received audio blob of size ${buffer.length} bytes from ${socket.username}`);

            // Save audio blob to a file
            const audioPath = path.join(__dirname, '..', 'tempAudio', `audio-${socket.username}-${Date.now()}.webm`);
            fs.writeFileSync(audioPath, Buffer.from(buffer));
            
            // Deduct tokens based on audio duration
            const cost = (TOKENS_PER_MINUTE / 4); // each recording is 15 seconds
            if ((await getUserTokens(socket.username)) <= cost) return;
            console.log(`Processing audio from ${socket.username}    cost: ${cost}    ${audioPath}`);

            // Transcribe audio
            const transcription = await transcribeAudio(audioPath);
            const newTokenBalance = await updateUserTokens(socket.username, -Math.ceil(cost));
            socket.emit('transcription', { transcription, newTokenBalance });

            // delete the temporary audio file
            fs.unlink(audioPath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${audioPath}:`, err);
                } else {
                    console.log(`Deleted temporary file ${audioPath}`);
                }
            });
        });
        
        socket.on('compile-notes', async (transcript, previousNotes) => {
            if (typeof transcript !== 'string' || typeof previousNotes !== 'string') return;
            if ((await getUserTokens(socket.username)) <= 10) return;

            console.log(`Compiling notes for user ${socket.username}`);
            const compiledNotes = await compileNotes(transcript, previousNotes);

            const newTokenBalance = await updateUserTokens(socket.username, -10);
            setUserNotes(socket.username, compiledNotes);

            socket.emit('compiled-notes', { compiledNotes, newTokenBalance });
        });

        socket.on('update-notes', async (newNotes) => {
            if (typeof newNotes != 'string') return;
            await setUserNotes(socket.username, newNotes);
        });

        socket.on('update-transcript', async (newTranscript) => {
            if (typeof newTranscript != 'string') return;
            await setUserTranscript(socket.username, newTranscript);
        });
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });
}
