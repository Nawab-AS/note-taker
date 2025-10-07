const OpenAI = require("openai");
const fs = require("fs");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (OPENAI_API_KEY == undefined) throw new Error("No OpenAI API key set");


const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

async function transcribeAudio (audioPath) {
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: "whisper-1",
        response_format: "text"
    });
    return transcription;
}


module.exports = { transcribeAudio };