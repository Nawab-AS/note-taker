const _intervalDuration = 27.5 * 1000;

// can be adjusted from UI
let QUIETNESS_DURATION = {stop: 10, start: 3}; // in frames
let VOLUME_THRESHOLD = 0.10;

// 'private' variables
let _stream;
let _mediaRecorder;
let _isRecording = false;


async function setupMicStream() { // allows .catch from index.js to trigger UI alert
    _stream = (await navigator.mediaDevices.getUserMedia({ audio: true }));
}

async function startMicRecorder(_sendToServer) { // call as a synchronous function
    if (_isRecording) return;
    _isRecording = true;
    console.log('Recording started');
    if (!_stream) throw new Error("Microphone stream not initialized.\nCall setupMicStream() first");

    function _startAudioChunk() {
        _mediaRecorder = new MediaRecorder(_stream);

        _mediaRecorder.addEventListener("dataavailable", (mic) => {
            const audioBlob = mic.data;
            if (audioBlob.size < 7500) return; // ignore tiny chunks

            // TODO: pre-process audio chunks to exclude empty audio
            //new Worker(new URL("compress.worker.js", import.meta.url));

            _sendToServer(audioBlob);
            console.log(`Sent audio chunk, size: ${audioBlob.size}`);
        });

        _mediaRecorder.start();
    }

    while (_isRecording){
        _startAudioChunk();
        await delay(_intervalDuration);
        if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
            _mediaRecorder.stop();
        }
    }
}

function stopMicRecorder() {
    _isRecording = false;
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
        _mediaRecorder.requestData(); // get any remaining data before stopping
        _mediaRecorder.stop();
        console.log('Recording stopped');
    }
    if (_stream) {
        _stream.getTracks().forEach(track => track.stop());
        _stream = undefined;
    }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}