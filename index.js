import dotenv from "dotenv";
import OpenAI from "openai";
import readlineSync from "readline-sync";

dotenv.config();

const api_key = process.env.OPEN_AI_API_KEY;

const client = new OpenAI({
  apiKey: api_key,
});

function getWeatherDetails(city = "") {
  if (city.toLowerCase() === "damak") return 10;
  if (city.toLowerCase() === "birtamode") return 20;
  if (city.toLowerCase() === "biratnagar") return 25;
  return null;
}

const tools = {
  "getWeatherDetails": getWeatherDetails
}

const SYSTEM_PROMPT = `
    You are an AI Assistant with Start, Plan, Action, Observation and Output State. 
    Wait for the user prompt and first Plan using available tools.
    After planning take the action with appropriate tools and wait for observation based on action.
    Once you get the observations, return the AI response based on Start prompt and observations.

    Strictly follow the JSON output format as in example

    Available tools:
    - function getWeatherDetails(city: string): number
    getWeatherDetails is a function that accepts city name as string and returns the weather details as number

    Example:
    START
    {"type" : "user", "user" : "What is the sum of the weather of damak and birtamode?"}
    {"type" : "plan", "plan" : "I will call the get weather details for damak"}
    {"type" : "action", "function" : "getWeatherDetails", "input" : "damak"}
    {"type" : "observation" , "observation" : "10°C"}
    {"type" : "user", "user" : "What is the sum of the weather of damak and birtamode?"}
`;

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

async function main() {
  while (true) {
    const query = readlineSync.question(">>  ");

    const q = {
      type: "user",
      user: query,
    };

    messages.push({ role: "user", content: JSON.stringify(q) });

    while (true) {
      const chat = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
      });

      const result = chat.choices[0].message.content;

      console.log("-----------Start AI--------------")
      console.log(result)
      console.log("-----------End AI--------------")


      messages.push({ role: 'assistant', content: result });

      const call = JSON.parse(result);

      if (call.type === "output") {
        console.log(`🤖: ${call.output}`);
        break;
      } else if (call.type === "action") {
        const fn = tools[call.function];
        const observation = fn(call.input);
        const obs = { type: "observation", observation: observation };
        messages.push({ role: "assistant", content: JSON.stringify(obs) });
      }
    }
  }
}

main().catch((err) => console.error(err));
