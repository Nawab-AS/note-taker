let volumeThreshold = 0.10;
let quietnessDuration = {stop: 1500, start: 500};
const _maxIntervalDuration = 29 * 1000; // 29 seconds to avoid 30s limit

let _mediaRecorder;
let _audioContext;
let _audioChunks;
let _analyser;
let _stream;

let _silenceTimer;
let _speakingTimer;
let _isRecording = false;

async function setupMicStream() {
    _stream = (await navigator.mediaDevices.getUserMedia({ audio: true }));
}

function setupMicRecorder(onInterval) {
    _audioContext = new AudioContext();
    const source = _audioContext.createMediaStreamSource(_stream);
    _analyser = _audioContext.createAnalyser();
    _analyser.minDecibels = -90;
    _analyser.maxDecibels = 0;
    _analyser.smoothingTimeConstant = 0.85;
    source.connect(_analyser);

    _audioChunks = [];
    _mediaRecorder = new MediaRecorder(_stream);
    _mediaRecorder.ondataavailable = event => {
      _audioChunks.push(event.data);
    };

    _mediaRecorder.onstop = () => {
        onInterval(_audioChunks);
        _audioChunks = [];
    };

    _mediaRecorder.start(250);

    // Set up audio processing for quietness detection
    _detectQuietness();

    console.log('Microphone and recorder set up');
}


function _detectQuietness() {
    const data = new Uint8Array(_analyser.frequencyBinCount);

    function skipQuietness() {
        _analyser.getByteFrequencyData(data);
        let volume = 0;
        for (let i = 0; i < data.length; i++) {
            volume += data[i];
        }
        const averageVolume = (volume / data.length) || 0;
        const currentDecibels = 20 * Math.log10(averageVolume / 255); // Convert to decibels


        if (currentDecibels < volumeThreshold * -100) { // If audio is now silent
            clearTimeout(_speakingTimer);

            if (!_silenceTimer) {
                _silenceTimer = setTimeout(() => { // wait for quietnessDuration ms of silence before pausing
                    // This can be canceled if speaking is detected again
                    _mediaRecorder.pause();
                }, quietnessDuration.stop);
            }
        } else { // audio is not silent
            clearTimeout(_silenceTimer);
            if (!isRecording && !_speakingTimer) {
            // Not recording and we're speaking, start the resume timer
                _speakingTimer = setTimeout(() => {
                    if (_mediaRecorder.state === 'paused') {
                        // Resuming after a period of silence
                        _mediaRecorder.resume();
                    }
                    isRecording = true;
                    statusDiv.textContent = 'Speaking detected, recording...';
                }, quietnessDuration.start);
            }
        }

        if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
            requestAnimationFrame(skipQuietness);
        }
    }
    requestAnimationFrame(skipQuietness);
}


function stopMicRecorder() {
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
        _mediaRecorder.stop();
        console.log('Recording stopped');
    }
}