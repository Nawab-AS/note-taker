const { createApp, ref, computed } = Vue;

quietnessThreshold = 0.10;
const isRecording = ref(false);
//const audioURLs = ref([]);
const transcript = ref("");
const coins = ref(userdata.coins);
const notes = ref("");
if (userdata.notes) notes.value = userdata.notes;``
const compiling = ref(false);


// socket.io client setup
const socket = io();
socket.on('connect', () => {
    console.log('Connected to websocket server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from websocket server');
});

socket.on('transcription', (data) => {
    transcript.value += data.transcription + " ";
    console.log(`Updated transcript (${transcript.value} characters)`);

    coins.value = data.newCoinBalance;
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
        //audioURLs.value.push(URL.createObjectURL(audioBlob));

        // send audio blob as buffer to server
        audioBlob.arrayBuffer().then(buffer => {
            socket.emit('audio-blob', buffer);
        });
    });
}

function stopRecording() {
    isRecording.value = false;
    stopMicRecorder();
}

let tempNotes = "";
function compileNotes() {
    if (coins.value <= estimatedCompilingCost.value) return;
    if (transcript.value.trim().length == 0) return;
    compiling.value = true;
    tempNotes = notes.value + "\n\n";
    notes.value = "Compiling notes...";
    socket.emit('compile-notes', transcript.value);
}

estimatedCompilingCost = computed(() => {
    if (transcript.value.trim().length == 0) return 0;
    return Math.max(Math.ceil(transcript.value.split(/[\s\n]+/).length * 1.2 * 0.05), 20);
});


socket.on('compiled-notes', (data) => {
    console.log("Received compiled notes from server", data);
    notes.value = tempNotes + data.compiledNotes;
    coins.value = data.newCoinBalance;
    compiling.value = false;
    console.log("Notes compiled");
});


let previousNotes = "";
function SaveNotes() {
    if (notes.value === previousNotes) return;
    socket.emit('update-notes', notes.value);
}
// save notes every 10 seconds or when the page is closed
setInterval(SaveNotes, 10000);
window.addEventListener('beforeunload', SaveNotes);


// mount Vue app

createApp({
    setup() {
        return {
            isRecording,
            startRecording,
            stopRecording,
            username: userdata.username,
            //audioURLs,
            transcript,
            coins,
            compileNotes,
            notes,
            compiling,
            estimatedCompilingCost,
        };
    }
}).mount('body');