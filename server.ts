import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // API endpoint for analyzing decisions
  app.post("/api/analyze", async (req, res) => {
    try {
      const { title, context, options } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Decision title is required" });
      }

      let prompt = `Analyze the following decision to help the user resolve their conflict or tie:
Decision: "${title}"
`;
      if (context) {
        prompt += `Background Context:\n${context}\n`;
      }
      if (options && options.length > 0) {
        prompt += `Options to compare:\n${options.map((opt: string, idx: number) => `- Option ${idx + 1}: ${opt}`).join("\n")}\n`;
      } else {
        prompt += `Analyze this decision as a binary choice (Doing it vs. Not doing it).\n`;
      }

      prompt += `
Please perform a complete analysis. Provide:
1. A clear "verdict" (recommendation and deep reasoning).
2. A list of pros and cons (each categorized, tagged with high/medium/low weight, and structured as 'pro' or 'con').
3. A comparison table (comparing the options, or comparing 'Do it' vs 'Don't do it').
4. A SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the main path.
5. A "tiebreaker factor" which is the single most critical, clarifying question or perspective that makes the choice clear.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are 'The Tiebreaker', an ultra-rational, highly objective, empathetic decision-making coach and analyst. Your job is to cut through analysis paralysis, break down decisions into structural components, and deliver a razor-sharp, objective verdict with visual weights, a detailed comparison table, a structured SWOT, and a single killer tiebreaker question.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "A short, direct title summarizing the recommended path" },
                  recommendation: { type: Type.STRING, description: "The recommended path or action (e.g., 'Proceed with Option A')" },
                  reasoning: { type: Type.STRING, description: "In-depth, empathetic yet ultra-rational logical explanation" },
                  confidenceScore: { type: Type.INTEGER, description: "Confidence score out of 100 (e.g., 85)" }
                },
                required: ["title", "recommendation", "reasoning", "confidenceScore"]
              },
              prosCons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique id, e.g. pc_1, pc_2" },
                    text: { type: Type.STRING, description: "The statement" },
                    type: { type: Type.STRING, description: "Must be exactly 'pro' or 'con'" },
                    weight: { type: Type.STRING, description: "Must be exactly 'high', 'medium', or 'low'" },
                    category: { type: Type.STRING, description: "e.g., Financial, Lifestyle, Career, Health, Long-Term" }
                  },
                  required: ["id", "text", "type", "weight", "category"]
                }
              },
              comparisonTable: {
                type: Type.OBJECT,
                properties: {
                  headers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Headers, e.g., ['Aspect', 'Option A', 'Option B']" },
                  rows: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        aspect: { type: Type.STRING, description: "The dimension being compared, e.g., Cost, Risk, Growth" },
                        values: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The analysis value for each column in the header (excluding the Aspect column)" }
                      },
                      required: ["aspect", "values"]
                    }
                  }
                },
                required: ["headers", "rows"]
              },
              swotAnalysis: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["strengths", "weaknesses", "opportunities", "threats"]
              },
              tiebreakerFactor: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "A high-impact, definitive question to break the deadlock" },
                  insight: { type: Type.STRING, description: "Why this question resolves the underlying dilemma" }
                },
                required: ["question", "insight"]
              }
            },
            required: ["verdict", "prosCons", "comparisonTable", "swotAnalysis", "tiebreakerFactor"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response from Gemini");
      }

      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during decision analysis" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
