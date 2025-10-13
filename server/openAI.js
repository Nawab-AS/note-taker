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


async function compileNotes (transcript) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are an assistant that compiles transcripts into notes (in markdown). Please note that there may be background chatter, tangents, reminders, etc in the audio that may or may not be relevant to the main content, don't highlight/emphasize it." },
            { role: "user", content: `Transcript:\n${transcript}` }
        ]
    });
    return response.choices[0].message.content.trim();
}


module.exports = { transcribeAudio, compileNotes };