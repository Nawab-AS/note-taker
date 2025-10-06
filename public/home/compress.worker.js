// This was partially created with the help of AI

// import lamejs for MP3 encoding
importScripts('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js'); // use .all.min.js if needed

const _FRAME_SIZE = 100; // in ms

self.onmessage = function(e) {
    const { audioBuffer, sampleRate, silenceThreshold, QUIETNESS_DURATION } = e.data


    // step 1: remove silent parts
    const rawAudioData = audioBuffer.getChannelData(0);
    const FRAME_SIZE = Math.floor(sampleRate * _FRAME_SIZE/1000);

    let activeSegments = [];
    let speaking = false;
    let currentSegmentStart = 0;
    let silenceFrameCount = 0;
    let speechFrameCount = 0;

    for (let i = 0; i < rawAudioData.length; i += FRAME_SIZE) {
        const frame = rawAudioData.subarray(i, Math.min(i + FRAME_SIZE, rawAudioData.length));

        // get geometric (Root Mean Square) average volume for the frame
        let sumSquares = 0;
        for (let j = 0; j < frame.length; j++) {
            sumSquares += frame[j] ** 2;
        }
        const rmsVolume = Math.sqrt(sumSquares / frame.length);

        if (rmsVolume > silenceThreshold) { // someone is speaking
            speechFrameCount++;
            silenceFrameCount = 0;
            if (!speaking && speechFrameCount >= QUIETNESS_DURATION.start) {
                speaking = true;
                currentSegmentStart = i;
            }
        } else { // no one is speaking
            silenceFrameCount++;
            speechFrameCount = 0;
            if (speaking && silenceFrameCount >= SPEECH_DURATION.stop) {
                speaking = false;
                activeSegments.push({
                    start: currentSegmentStart,
                    end: i - (MIN_SILENCE_FRAMES * FRAME_SIZE)
                });
            }
        }
    }
    
    if (speaking) {
        activeSegments.push({ start: currentSegmentStart, end: rawAudioData.length });
    }

    let combinedLength = 0;
    activeSegments.forEach(segment => {
        combinedLength += (segment.end - segment.start);
    });

    const processedAudioData = new Float32Array(combinedLength);
    let offset = 0;
    activeSegments.forEach(segment => {
        const segmentData = rawAudioData.subarray(segment.start, segment.end);
        processedAudioData.set(segmentData, offset);
        offset += segmentData.length;
    });



    // step 2: encode to MP3
    const int16Data = new Int16Array(processedAudioData.length);
    const volume = 0x7FFF;
    for (let i = 0; i < int16Data.length; i++) {
        int16Data[i] = processedAudioData[i] * volume;
    }

    const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
    const mp3Data = [];
    
    const mp3Buffer = mp3Encoder.encodeBuffer(int16Data);
    if (mp3Buffer.length > 0) {
        mp3Data.push(mp3Buffer);
    }
    const mp3BufferEnd = mp3Encoder.flush();
    if (mp3BufferEnd.length > 0) {
        mp3Data.push(mp3BufferEnd);
    }
    
    const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
    self.postMessage(mp3Blob);
}