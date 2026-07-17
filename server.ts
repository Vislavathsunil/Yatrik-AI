import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please configure it in your Secrets / Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient wrapper for Gemini content generation to handle temporary 503/429/overload issues with automatic retries and fallback
async function generateContentWithFallback(
  ai: GoogleGenAI,
  primaryModel: string,
  contents: any,
  config?: any
) {
  const maxRetries = 2;
  let delayMs = 1500;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`Sending request to Gemini (${primaryModel}) - Attempt ${attempt}`);
      const response = await ai.models.generateContent({
        model: primaryModel,
        contents,
        config,
      });
      return response;
    } catch (error: any) {
      console.error(`Error on attempt ${attempt} with ${primaryModel}:`, error);

      const errorStr = String(error).toLowerCase();
      const is503OrRateLimit =
        error?.status === "UNAVAILABLE" ||
        error?.status === "RESOURCE_EXHAUSTED" ||
        error?.code === 503 ||
        error?.code === 429 ||
        errorStr.includes("503") ||
        errorStr.includes("unavailable") ||
        errorStr.includes("high demand") ||
        errorStr.includes("temporary") ||
        errorStr.includes("exhausted") ||
        errorStr.includes("limit") ||
        errorStr.includes("overload");

      // Retry if it's a transient server or rate limit error
      if (is503OrRateLimit && attempt <= maxRetries) {
        console.warn(`Gemini experiencing high demand. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
        continue;
      }

      // If retries are exhausted or it's a non-retryable 503/429, fall back to gemini-3.1-flash-lite
      if (primaryModel === "gemini-3.5-flash" && is503OrRateLimit) {
        const fallbackModel = "gemini-3.1-flash-lite";
        console.warn(`Switching to fallback model ${fallbackModel} due to high demand/rate limit on gemini-3.5-flash...`);
        try {
          const response = await ai.models.generateContent({
            model: fallbackModel,
            contents,
            config,
          });
          return response;
        } catch (fallbackError: any) {
          console.error(`Fallback to ${fallbackModel} also failed:`, fallbackError);
          throw fallbackError;
        }
      }

      throw error;
    }
  }
  throw new Error("Failed to generate content after retries.");
}

// API endpoint to generate travel itinerary
app.post("/api/generate-itinerary", async (req, res) => {
  try {
    const { destination, days, budget, travelers, travelStyle } = req.body;

    // Validate inputs
    if (!destination || typeof destination !== "string" || destination.trim() === "") {
      return res.status(400).json({ error: "Destination is required." });
    }
    const durationDays = parseInt(days, 10);
    if (isNaN(durationDays) || durationDays < 1 || durationDays > 14) {
      return res.status(400).json({ error: "Duration must be between 1 and 14 days." });
    }
    const numTravelers = parseInt(travelers, 10);
    if (isNaN(numTravelers) || numTravelers < 1) {
      return res.status(400).json({ error: "Number of travelers must be at least 1." });
    }
    if (!budget || typeof budget !== "string") {
      return res.status(400).json({ error: "Budget is required." });
    }
    if (!travelStyle || typeof travelStyle !== "string") {
      return res.status(400).json({ error: "Travel style is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are Yatrik AI's itinerary engine, an expert travel planner with deep destination knowledge across budgets and travel styles.
Your task is to generate a highly detailed and cohesive day-wise travel itinerary.

SPEED & CONCISENESS RULES — TO GENERATE EXTREMELY QUICKLY:
1. Keep each entry in "activities", "attractions", and "foodRecommendations" very short and punchy (ideally under 12 words). Avoid verbose descriptive paragraphs.
2. Provide practical, high-value content without any fluff or padding.

GROUNDING RULES — YOU MUST STRICTLY FOLLOW:
1. Recommend only real, well-known attractions, neighborhoods, and food types for the destination. Do not invent restaurant names, hotel names, or attractions you are not confident exist.
2. If you are not highly confident a specific place name is accurate, describe it generically instead (e.g., "a rooftop café in the old town" instead of a fabricated proper name).
3. Do not fabricate prices. Give cost estimates as ranges appropriate to the stated budget tier, labeled as estimates. All currency, budget, and cost estimates MUST be in Indian Rupees (INR) with the '₹' symbol (e.g., '₹1,500 - ₹3,000'). Under no circumstances should USD ($), EUR (€), or other currencies be used.
4. Base every recommendation only on the input variables given. Do not assume traveler preferences, dietary needs, or mobility constraints that were not provided.
5. Generate exactly ${durationDays} entries in the "itinerary" array, one per day.
6. Every array field ("activities", "attractions", "foodRecommendations") must contain at least 2 items.
7. Keep the tone practical, helpful, and specific to the stated budget and travel style — do not pad with generic filler.
8. Output valid, parseable JSON that strictly matches the specified schema. Any malformed character will break the application.
9. EVERY single cost estimate, reference to money, price tag, or range in the itinerary MUST be formatted in Indian Rupees using the '₹' symbol. No other currency is permitted.`;

    const prompt = `Generate a complete travel itinerary for:
- Destination: ${destination}
- Duration: ${durationDays} days
- Budget: ${budget}
- Travelers: ${numTravelers}
- Travel style: ${travelStyle}

Ensure the itinerary has exactly ${durationDays} days, with practical, structured recommendations suited to ${numTravelers} travelers seeking a ${travelStyle} trip on a ${budget} budget. Let the attractions, activities, and food recommendations be as contextual and authentic as possible. Keep descriptions concise to ensure fast generation.`;

    const response = await generateContentWithFallback(ai, "gemini-3.5-flash", prompt, {
        systemInstruction,
        temperature: 0.2, // Lower temperature means faster, more focused token generation
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripTitle: {
              type: Type.STRING,
              description: "A catchy, custom, inspiring title for the trip based on inputs, e.g. '5-Day Cultural Escape in Kyoto'"
            },
            destination: { type: Type.STRING },
            durationDays: { type: Type.INTEGER },
            budget: { type: Type.STRING },
            travelers: { type: Type.INTEGER },
            travelStyle: { type: Type.STRING },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: {
                    type: Type.STRING,
                    description: "An evocative theme or title for this specific day, e.g. 'Historic Temples & Traditional Tea Gardens'"
                  },
                  activities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "At least 2 specific, compelling, sequentially arranged activities for this day."
                  },
                  attractions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "At least 2 real, verified attractions visited today."
                  },
                  foodRecommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "At least 2 local food types or authentic dining location descriptions suitable for the budget."
                  },
                  estimatedCostRange: {
                    type: Type.STRING,
                    description: "Cost estimate range for this day in Indian Rupees (INR / ₹) only, e.g., '₹1,500 - ₹3,000'. Must be strictly in INR with the ₹ symbol."
                  }
                },
                required: ["day", "title", "activities", "attractions", "foodRecommendations", "estimatedCostRange"]
              },
              description: `Exactly ${durationDays} day entries, one for each day of the duration.`
            },
            travelTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "At least 3 practical, destination-specific travel tips for the selected travel style and budget (e.g. local transport advice, cultural etiquette, packing recommendations)."
            }
          },
          required: ["tripTitle", "destination", "durationDays", "budget", "travelers", "travelStyle", "itinerary", "travelTips"]
        }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response received from the AI model.");
    }

    const parsedJson = JSON.parse(resultText);
    return res.json(parsedJson);

  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate travel itinerary. Please check your configuration and try again."
    });
  }
});

// API endpoint for Yatrik AI Assistant Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are Yatrik AI Assistant, an extremely knowledgeable, warm, and helpful digital travel companion specializing in Indian tourism.
Your role is to help users plan personalized trips, suggest amazing offbeat destinations, recommend authentic regional food, guide them on budgets, and help fine-tune their travel ideas.

CRITICAL RULE: Always use Indian Rupees (INR) with the '₹' symbol (e.g. ₹1,500, ₹5,000) for any price estimates, budgets, hotel rates, or cost mentions. Never use USD ($) or other currencies.

Your introductory info:
"Yatrik AI Assistant is your intelligent travel companion that helps you plan personalized trips across India. Simply describe your travel preferences, and it creates customized itineraries, suggests destinations, recommends hotels and local attractions, optimizes your budget, and lets you download your complete travel plan."

Keep your answers beautifully structured, practical, inspiring, and concise. Use bullet points and clean markdown formatting where appropriate.
Always keep the conversation focused on Indian destinations and travel planning. If the user asks about unrelated topics, politely redirect them back to planning their Incredible India escape.
If the user wants to plan a trip, summarize the perfect destination suggestion and invite them to click 'AI Plan this Escape' or load it in the planner.`;

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : m.role === "model" ? "model" : "user",
      parts: [{ text: m.content || m.text }]
    }));

    const response = await generateContentWithFallback(ai, "gemini-3.5-flash", contents, {
        systemInstruction,
        temperature: 0.7,
    });

    return res.json({ text: response.text || "I couldn't generate a response. Please try again." });
  } catch (error: any) {
    console.error("Error in chat endpoint:", error);
    return res.status(500).json({ error: error.message || "Failed to communicate with Yatrik AI Assistant." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
