const { createApp, ref } = Vue;

quietnessThreshold = 0.10;
const isRecording = ref(false);
const username = ref("Nawab-AS")


// socket.io client setup
const socket = io();
socket.on('connect', () => {
    console.log('Connected to server via WebSocket');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});


// Audio recording setup

async function startRecording() {
    isRecording.value = true;
    await setupMicStream()
        .catch((err)=>{
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check permissions.');
            isRecording.value = false;
            return;
        });

    setupMicRecorder((audioChunks) => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioBlob.arrayBuffer().then(buffer => {
            socket.emit('audio-blob', buffer);
        });
    });
    
    console.log('Recording started');
}

function stopRecording() {
    isRecording.value = false;
    stopMicRecorder();
}



// mount Vue app

createApp({
    setup() {
        return {
            isRecording,
            startRecording,
            stopRecording,
            username,
        };
    }
}).mount('body');