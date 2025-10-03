const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const { transcribeAudio } = require('./openAI.js');

module.exports = function(app) {
    const io = new Server(app);

    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('audio-blob', (buffer) =>{
            const audioPath = path.join(__dirname, '..', 'tempAudio', `audio|${socket.id}|${Date.now()}.webm`);
            fs.writeFileSync(audioPath, Buffer.from(buffer));
            console.log(`Saved audio blob to ${audioPath}`);

            // Transcribe audio
            transcribeAudio(audioPath).then(transcription => {
                console.log('Transcription:', transcription);
            });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });
});
}