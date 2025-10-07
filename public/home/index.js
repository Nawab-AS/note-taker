const { createApp, ref, watch } = Vue;

quietnessThreshold = 0.10;
const isRecording = ref(false);
//const audioURLs = ref([]);  // for testing
const transcript = ref("");
const coins = ref(initialCoins);


// socket.io client setup
const socket = io();
socket.on('connect', () => {
    console.log('Connected to server via WebSocket');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('transcription', (text) => {
    console.log('Received transcription:', text);
    transcript.value += text + " ";

    let newCoins = coins.value - text.split(' ').length;
    if (newCoins < 0) {
        coins.value = 0;
    } else {
        coins.value = newCoins;
    }
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

    startMicRecorder((audioBlob) => {
        //audioURLs.value.push(URL.createObjectURL(audioBlob)); // for testing

        // send audio blob to server
        audioBlob.arrayBuffer().then(buffer => {
            // blobs must be converted to ArrayBuffers before sending to server
            socket.emit('audio-blob', buffer);
        });
    });
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
            //audioURLs,
            transcript,
            coins,
        };
    }
}).mount('body');