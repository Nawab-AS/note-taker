const { Server } = require('socket.io');
const { validateLogin, updateUserCoins } = require('./database.js');
const fs = require('fs');
const path = require('path');
const { transcribeAudio } = require('./openAI.js');

module.exports = function(app) {
    const io = new Server(app, { cookie: true });

    io.use(async (socket, next) => {
        const rawCookies = socket.handshake.headers.cookie;
        if (!rawCookies) return next(new Error("No cookies found"));
        const cookies = Object.fromEntries(rawCookies.split('; ').map(cookie => cookie.split('=')));
        const authToken = cookies['authToken'];
        if (!authToken) return next(new Error("No auth token found"));
        next();
    });

    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('audio-blob', (buffer) =>{
            if (!(buffer instanceof Buffer)) return;
            // Save audio blob to a file
            const audioPath = path.join(__dirname, '..', 'tempAudio', `audio-${socket.id}-${Date.now()}.webm`);
            fs.writeFileSync(audioPath, Buffer.from(buffer));

            // Approximate the length of the audio file
            const bitrate = 96000; // 96 kbps
            const audioDurationInSeconds = (buffer.length * 8) / bitrate; // Convert bytes to bits and divide by bitrate
            updateUserCoins(socket.id, -Math.ceil(audioDurationInSeconds));

            console.log(`Saved audio blob to ${audioPath}`);

            // Transcribe audio
            transcribeAudio(audioPath).then((transcription) => {
                socket.emit('transcription', transcription);
                // delete the temporary audio file
                fs.unlink(audioPath, (err) => {
                    if (err) {
                        console.error(`Error deleting file ${audioPath}:`, err);
                    } else {
                        console.log(`Deleted temporary file ${audioPath}`);
                    }
                });
            });
            console.log("Audio received");



        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });
});
}