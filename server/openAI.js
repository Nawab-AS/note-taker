import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const SPEECH_TO_TEXT_MODEL = "whisper-1";
const TEXT_COMPLETION_MODEL = "gpt-4.1-mini";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (OPENAI_API_KEY == undefined) throw new Error("No OpenAI API key set");


const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

async function transcribeAudio (audioPath) {
    const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: SPEECH_TO_TEXT_MODEL,
        response_format: "text"
    });
    return transcription;
}

const promptTemplate = fs.readFileSync("server/prompt.txt", "utf-8");
async function compileNotes (transcript, previousNotes) {
    const response = await client.responses.create({
        model: TEXT_COMPLETION_MODEL,
        input: [
            { role: "system", content: promptTemplate },
            { role: "system", content: `Previous Notes:\n${previousNotes}` },
            { role: "user", content: `Transcript:\n${transcript}` },
        ],
        text: {
            verbosity: "medium",
        },
        temperature: 0.7,
    });
    return response.output_text;
}


export { transcribeAudio, compileNotes };