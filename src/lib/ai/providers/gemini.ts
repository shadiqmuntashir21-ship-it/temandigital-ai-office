import { GoogleGenAI } from "@google/genai";
import type { AIProvider, StructuredRequest, TextRequest } from "@/lib/ai/types";

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi pada environment server.");
  }
  return new GoogleGenAI({ apiKey });
}

function model() {
  return process.env.GEMINI_MODEL || "gemini-3.8-flash";
}

export const geminiProvider: AIProvider = {
  name: "gemini",

  async generateText({ system, prompt }: TextRequest) {
    const interaction = await client().interactions.create({
      model: model(),
      system_instruction: system,
      input: prompt,
    });

    return interaction.output_text?.trim() || "Saya belum menghasilkan respons.";
  },

  async generateStructured<T>({ system, prompt, schema }: StructuredRequest) {
    const interaction = await client().interactions.create({
      model: model(),
      system_instruction: system,
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema,
      },
    });

    const raw = interaction.output_text;
    if (!raw) throw new Error("AI tidak mengembalikan output terstruktur.");

    return JSON.parse(raw) as T;
  },
};
