const { createApp, ref, watch } = Vue;

const isRecording = ref(false);
const transcript = ref("");
const tokens = ref("");
const notes = ref("");
if (userdata.notes) notes.value = userdata.notes;
if (userdata.tokens) tokens.value = userdata.tokens;
if (userdata.transcript) transcript.value = userdata.transcript;
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

    tokens.value = data.newTokenBalance;
    if (stopping) {
        isRecording.value = false;
        stopping = false;
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
        audioBlob.arrayBuffer().then(buffer => {
            socket.emit('audio-blob', buffer);
        });
    });
}

let stopping = false;
function stopRecording() {
    stopping = true;
    stopMicRecorder();
}


function compileNotes() {
    if (tokens.value <= 10) return;
    if (transcript.value.trim().length == 0) return;
    compiling.value = true;
    socket.emit('compile-notes', transcript.value, notes.value);
}



socket.on('compiled-notes', (data) => {
    console.log("Received compiled notes from server", data);
    notes.value = data.compiledNotes;
    tokens.value = data.newTokenBalance;
    compiling.value = false;
    transcript.value = "";
    console.log("Notes compiled");
});


watch(notes, (newVal) => {
    socket.emit('update-notes', newVal);
});


watch(transcript, (newVal) => {
    socket.emit('update-transcript', newVal);
});

// mount Vue app

createApp({
    setup() {
        return {
            isRecording,
            startRecording,
            stopRecording,
            username: userdata.username,
            transcript,
            tokens,
            compileNotes,
            notes,
            compiling,
        };
    }
}).mount('body');