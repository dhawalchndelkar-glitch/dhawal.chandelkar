import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AdAnalysis {
  headline: string;
  subheadline: string;
  tone: string;
  targetAudience: string;
  keyBenefits: string[];
  visualStyle: string;
}

export interface PersonalizationPlan {
  originalUrl: string;
  newHeadline: string;
  newSubheadline: string;
  newCtaText: string;
  croImprovements: string[];
  personalizationReasoning: string;
  heroImagePrompt: string;
}

export interface FileData {
  base64: string;
  mimeType: string;
}

export async function analyzeAd(adInput: string, isUrl: boolean, fileData?: FileData): Promise<AdAnalysis> {
  const prompt = `Analyze this ad creative ${isUrl ? `from this URL: ${adInput}` : `with this description: ${adInput}`}. 
  ${fileData ? "I have also attached the ad creative file (image/video) for your analysis." : ""}
  Extract the key elements needed to personalize a landing page.
  Return the analysis in JSON format.`;

  const contents: any[] = [{ text: prompt }];
  if (fileData) {
    contents.push({
      inlineData: {
        data: fileData.base64,
        mimeType: fileData.mimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          subheadline: { type: Type.STRING },
          tone: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          keyBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualStyle: { type: Type.STRING },
        },
        required: ["headline", "subheadline", "tone", "targetAudience", "keyBenefits", "visualStyle"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generatePersonalization(
  adAnalysis: AdAnalysis,
  landingPageHtml: string,
  originalUrl: string
): Promise<PersonalizationPlan> {
  const prompt = `
    AD ANALYSIS:
    ${JSON.stringify(adAnalysis, null, 2)}

    LANDING PAGE CONTENT (HTML/TEXT):
    ${landingPageHtml.substring(0, 10000)} // Limit to 10k chars for context

    TASK:
    Based on the ad analysis and the existing landing page, generate a personalized version of the landing page's hero section and key copy.
    The goal is to increase conversion (CRO) by aligning the landing page perfectly with the ad's promise and tone.
    
    Return the plan in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalUrl: { type: Type.STRING },
          newHeadline: { type: Type.STRING },
          newSubheadline: { type: Type.STRING },
          newCtaText: { type: Type.STRING },
          croImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
          personalizationReasoning: { type: Type.STRING },
          heroImagePrompt: { type: Type.STRING, description: "A prompt for an image that matches the ad's visual style and the new copy" },
        },
        required: ["newHeadline", "newSubheadline", "newCtaText", "croImprovements", "personalizationReasoning", "heroImagePrompt"],
      },
    },
  });

  const result = JSON.parse(response.text || "{}");
  result.originalUrl = originalUrl;
  return result;
}
