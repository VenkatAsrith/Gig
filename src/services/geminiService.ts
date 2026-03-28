import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateGigDescription = async (title: string, skills: string[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional and catchy gig description for a freelancer offering "${title}" services. The freelancer has skills in: ${skills.join(", ")}. Make it engaging and highlight value for clients.`,
    config: {
      systemInstruction: "You are an expert freelance marketplace copywriter.",
    },
  });
  return response.text;
};

export const suggestPricingAndTags = async (title: string, description: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following gig title and description, suggest a competitive price range (in USD) and 5 relevant tags for searchability.\nTitle: ${title}\nDescription: ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          minPrice: { type: Type.NUMBER },
          maxPrice: { type: Type.NUMBER },
          suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["minPrice", "maxPrice", "suggestedTags"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const analyzeProfile = async (bio: string, skills: string[], experience: any[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze this freelancer profile and provide 3 specific suggestions to make it more attractive to high-paying clients.\nBio: ${bio}\nSkills: ${skills.join(", ")}\nExperience: ${JSON.stringify(experience)}`,
    config: {
      systemInstruction: "You are a career coach for elite freelancers.",
    },
  });
  return response.text;
};

export const matchFreelancers = async (jobDescription: string, freelancers: any[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Given this job description: "${jobDescription}", and this list of freelancers: ${JSON.stringify(freelancers)}, identify the top 3 best matches and explain why for each.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            freelancerId: { type: Type.STRING },
            matchScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
            reason: { type: Type.STRING },
          },
          required: ["freelancerId", "matchScore", "reason"],
        },
      },
    },
  });
  return JSON.parse(response.text);
};
