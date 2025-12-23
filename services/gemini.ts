import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, RiskLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating the likelihood of being fake/scam. 0 is perfectly safe, 100 is definitely fake.",
    },
    verdict: {
      type: Type.STRING,
      description: "A short verdict title like 'Likely Safe', 'Suspicious', or 'High Risk Scam'.",
    },
    explanation: {
      type: Type.STRING,
      description: "A detailed professional explanation of the analysis.",
    },
    simplifiedExplanation: {
      type: Type.STRING,
      description: "A 'Explain Like I'm 12' version of the explanation. Simple language, no jargon.",
    },
    suspiciousPhrases: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of specific words or phrases found in the text that are suspicious (e.g., 'act now', 'free money').",
    },
    verificationSources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          url: { type: Type.STRING, description: "A generic URL to the source's home page or search page." },
        },
      },
      description: "A list of 2-3 trustworthy sources where the user can verify this info (e.g., Snopes, IRS.gov).",
    },
    tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-4 practical, actionable tips for the user to verify the content or avoid the scam.",
    },
  },
  required: ["score", "verdict", "explanation", "simplifiedExplanation", "suspiciousPhrases", "verificationSources", "tips"],
};

export const analyzeContent = async (text: string, imageBase64?: string): Promise<AnalysisResult> => {
  if ((!text || text.trim().length < 5) && !imageBase64) {
    throw new Error("Please provide text or an image to analyze.");
  }

  const promptText = `
    Analyze the following content (text and/or image) for fake news, misinformation, phishing attempts, or scam patterns.
    
    If an image is provided:
    1. Extract and analyze the text within the image (e.g. email screenshots, social media posts).
    2. Analyze visual cues (fake logos, urgency buttons, formatting).

    User Text Context: "${text.substring(0, 5000)}"

    Provide:
    1. A likelihood score (0-100).
    2. A verdict.
    3. A detailed explanation.
    4. A SIMPLIFIED explanation (Explain Like I'm 12).
    5. A list of exact suspicious phrases found in the content (for highlighting).
    6. Suggested sources to verify the information.
    7. Actionable tips.
  `;

  const parts: any[] = [];
  
  if (imageBase64) {
    // Remove data URL prefix if present to get raw base64
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64
      }
    });
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a world-class security and misinformation expert designed to help non-technical users. Be concise, empathetic, and clear.",
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response received from AI.");
    }

    const data = JSON.parse(jsonText);

    // Determine internal RiskLevel enum based on score for UI styling
    let riskLevel = RiskLevel.SAFE;
    if (data.score >= 70) {
      riskLevel = RiskLevel.HIGH_RISK;
    } else if (data.score >= 30) {
      riskLevel = RiskLevel.SUSPICIOUS;
    }

    return {
      score: data.score,
      verdict: data.verdict,
      riskLevel: riskLevel,
      explanation: data.explanation,
      simplifiedExplanation: data.simplifiedExplanation,
      tips: data.tips,
      suspiciousPhrases: data.suspiciousPhrases || [],
      verificationSources: data.verificationSources || []
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze content. Please try again later.");
  }
};