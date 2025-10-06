const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const { transcribeAudio } = require('./openAI.js');

module.exports = function(app) {
    const io = new Server(app);

    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('audio-blob', (buffer) =>{
            if (!(buffer instanceof Buffer)) return;
            // Save audio blob to a file
            const audioPath = path.join(__dirname, '..', 'tempAudio', `audio-${socket.id}-${Date.now()}.webm`);
            fs.writeFileSync(audioPath, Buffer.from(buffer));
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