const { Server } = require('socket.io');
const { updateUserCoins, getUserCoins, setUserNotes } = require('./database.js');
const fs = require('fs');
const path = require('path');
const { transcribeAudio, compileNotes } = require('./openAI.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

(async () => {
    console.log("Compiling notes:\n\n", await compileNotes("Before we enter the war, where local strongmen ruled over their own provinces, allied in ever-shifting cliques, and waged constant war against each other, Sun Yat-sen split with the nominal central government in Beijing to create his own government.\n based around Canton. From there, he reformed the KMT, the Kuomintang, or Nationalist Party, and called for a great military campaign to destroy the warlords and reunify China. He hoped for support from Western nations, but when that came.\n  he turned to the USSR for his military and political help. Soviet advisor Mikhail Baradei urged the KMT to join with the CCP to boost its appeal and resources. That's known as the First United Front, right? You remember that?", "It was a decision that was made by the CCP as well, after the second party. Sun agreed, and the two parties formed the first two diatom fronts in 1924. But by March 1925, Sun Yat-sen had died of cancer in Chiang Kai-shek.\n replaced him as military leader of the Canton government. Chiang had studied military theory in Moscow, but was worried about the left-right split within the KMT. In March 1926, Chiang's fears of a possible communist takeover led him to partially.\n to suppress the CCP, but they can't. What is the name of the event that ends this election, that triggers the Chinese Civil War? What? 5,000 people are murdered. 5,000 cooperators are murdered.\n In 1926, Chiang launched a northern expedition against the warlords. His National Revolutionary Army, or NRA, defeated warlord after warlord, but success increased the tensions with the CCP, which set up communist labor unions in the wake of the NRA."));
})();

const SESSION_SECRET = process.env.SESSION_SECRET;

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
            if ((await getUserCoins(socket.username)) <= 0) return;

            // Save audio blob to a file
            const audioPath = path.join(__dirname, '..', 'tempAudio', `audio-${socket.username}-${Date.now()}.webm`);
            fs.writeFileSync(audioPath, Buffer.from(buffer));

            // Approximate the length of the audio file
            const bitrate = 96000; // 96 kbps
            const audioDurationInSeconds = (buffer.length * 8) / bitrate; // Convert bytes to bits and divide by bitrate
            const newCoinBalance = await updateUserCoins(socket.username, -Math.ceil(audioDurationInSeconds));
            console.log(`Audio duration: ${audioDurationInSeconds.toFixed(2)} seconds, new coin balance: ${newCoinBalance}`);

            console.log(`Saved audio blob to ${audioPath}`);

            // Transcribe audio
            transcribeAudio(audioPath).then((transcription) => {
                socket.emit('transcription', { transcription, newCoinBalance });
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
        });
        
        socket.on('compile-notes', async (transcript) => {
            if (typeof transcript !== 'string') return;
            if ((await getUserCoins(socket.username)) <= 0) return;

            console.log(`Compiling notes for user ${socket.username}`);
            const compiledNotes = await compileNotes(transcript);

            const cost = -Math.max(Math.ceil((transcript.split(/[\s\n]+/).length + compiledNotes.split(/[\s\n]+/).length) * 0.05), 20);

            const newCoinBalance = await updateUserCoins(socket.username, cost);
            setUserNotes(socket.username, compiledNotes);

            socket.emit('compiled-notes', { compiledNotes, newCoinBalance });
        });

        socket.on('update-notes', async (newNotes) => {
            if (typeof newNotes != 'string') return;
            //console.log(`Updating notes for user ${socket.username}\nnotes: ${newNotes}`);
            await setUserNotes(socket.username, newNotes);
        });
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });
}
