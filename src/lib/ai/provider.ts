import type { AIProvider } from "@/lib/ai/types";
import { geminiProvider } from "@/lib/ai/providers/gemini";

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "gemini";

  if (provider === "gemini") return geminiProvider;

  throw new Error(`AI provider "${provider}" belum didukung.`);
}
