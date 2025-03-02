import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const api_key = process.env.OPEN_AI_API_KEY;

const client = new OpenAI({
  apiKey: api_key,
});
