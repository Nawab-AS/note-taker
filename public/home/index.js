const { createApp } = Vue;

createApp({
    data() {
        return {
            username: "User",
            notebooks: [
                { id: 1, name: 'Personal Notes' },
                { id: 2, name: 'Work Projects' },
                { id: 3, name: 'Ideas' }
            ],
            newNotebook: ''
        }
    },
    methods: {
        openNotebook(notebook) {
            // Replace with your navigation logic
            window.location.href = `/notebooks/${encodeURIComponent(notebook.id)}/`;
        },
        addNotebook() {
            if (!this.newNotebook.trim()) return;
            const newId = this.notebooks.length
                ? Math.max(...this.notebooks.map(n => n.id)) + 1
                : 1;
            this.notebooks.push({
                id: newId,
                name: this.newNotebook.trim()
            });
            this.newNotebook = '';
        }
    }
}).mount('body');


// socket.io client setup
const socket = io();
socket.on('connect', () => {
    console.log('Connected to server via WebSocket');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});


// Audio recording setup
let mediaRecorder;
let audioChunks;

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
            // event.data.arrayBuffer().then(buffer => {
            //     socket.emit('audio-chunk', buffer);
            // });
        }
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioBlob.arrayBuffer().then(buffer => {
            socket.emit('audio-blob', buffer);
        });
    };

    mediaRecorder.start();
    console.log('Recording started');
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        console.log('Recording stopped');
    }
}