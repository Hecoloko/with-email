import { GoogleGenAI, Type } from "@google/genai";
import type { Applicant } from "../types";

// Lazy-initialized AI client to prevent app crash on load if API key is missing.
let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
  if (!aiInstance) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // This error will be caught by the calling functions and displayed in the UI.
      throw new Error("Gemini API key is not configured. Please ensure the API_KEY environment variable is set in your deployment environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// Helper function to convert a File object to a GoogleGenerativeAI.Part object
const fileToGenerativePart = async (file: File) => {
  // FIX: Explicitly type the Promise to resolve with a string to fix the TypeScript error.
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


export const parseResume = async (file: File): Promise<{name: string, role: string, email: string, phone: string, summary: string}> => {
  const ai = getAi();
  const filePart = await fileToGenerativePart(file);
  const prompt = "Analyze this resume and extract the applicant's full name, the job role they seem most qualified for, their email address, their phone number, and a brief summary of their skills and experience.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [filePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Applicant's full name" },
          role: { type: Type.STRING, description: "Most relevant job role" },
          email: { type: Type.STRING, description: "Applicant's email address" },
          phone: { type: Type.STRING, description: "Applicant's phone number" },
          summary: { type: Type.STRING, description: "A brief summary of the resume" },
        },
        required: ['name', 'role', 'email', 'phone', 'summary'],
      }
    }
  });
  
  const responseText = response.text;
  if (!responseText) {
    throw new Error("AI did not return a valid response for resume parsing.");
  }
  const parsedData = JSON.parse(responseText);
  return parsedData;
};

export async function summarizeNotes(applicant: Applicant): Promise<string> {
  const ai = getAi();
  if (!applicant.notes?.length) return "No notes to summarize.";

  const allNotes = applicant.notes
    .map(n => `[${new Date(n.created_at).toLocaleString()}]: ${n.content}`)
    .join("\n");

  const prompt =
    `Summarize the following notes about ${applicant.name} (role: ${applicant.role}). ` +
    `Focus on strengths, weaknesses, and action items. Be concise and professional.\n\n${allNotes}`;

  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text ?? "Could not generate a summary from the notes.";
}

export async function generateInterviewQuestions(
  applicant: Applicant,
  numQuestions: number,
  focus: string
): Promise<string> {
  const ai = getAi();
  const focusLine = focus?.trim() ? `Focus on: ${focus.trim()}. ` : "";
  const prompt =
    `Generate ${numQuestions} insightful interview questions for ${applicant.name} applying for ${applicant.role}. ` +
    focusLine +
    `Keep them specific and practical.`;

  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text ?? "Could not generate interview questions.";
}

export const generateProfessionalFollowUpEmail = async (applicant: Applicant): Promise<{ subject: string; body: string }> => {
  const ai = getAi();
  const prompt = `Generate a professional, general-purpose follow-up email to a job applicant.
  
  **Applicant Details:**
  - Name: ${applicant.name}
  - Applying for Role: ${applicant.role}

  **Instructions:**
  - The tone should be polite, professional, and encouraging.
  - The purpose is to touch base, acknowledge their application, and let them know you are reviewing it.
  - Keep the message concise.
  - End the email with a professional closing like "Best regards,". Do not add a placeholder for the sender's name like "[Your Name]".
  - Return the result as a JSON object with "subject" and "body" keys. 
  - The body should be plain text with proper paragraph spacing and line breaks for readability (use '\\n' for newlines).
  
  Example JSON format:
  {
    "subject": "Regarding your application for the ${applicant.role} position",
    "body": "Dear ${applicant.name},\\n\\nThank you for your interest in the ${applicant.role} position at our company. We have received your application and our hiring team is currently reviewing it.\\n\\nWe appreciate your patience and will be in touch if your qualifications match our needs for the role.\\n\\nBest regards,"
  }`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING },
                },
                required: ['subject', 'body'],
            }
        }
    });

    const responseText = response.text;
    if (!responseText) {
        throw new Error("AI did not return a valid response for email generation.");
    }
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (error) {
    console.error("Gemini email generation failed:", error);
    throw new Error("Failed to generate email content with AI. Please try a different prompt or write the email manually.");
  }
};

export const generateCustomEmail = async (applicant: Applicant, userPrompt: string): Promise<{ subject: string; body: string }> => {
  const ai = getAi();
  if (!userPrompt.trim()) {
    return { subject: '', body: '' };
  }

  const prompt = `An HR manager wants to send an email to a job applicant.
  
  **Applicant Details:**
  - Name: ${applicant.name}
  - Applying for Role: ${applicant.role}

  **Manager's Request:** "${userPrompt}"

  Based on the manager's request, generate a professional and appropriate email.
  Return the result as a JSON object with "subject" and "body" keys. 
  The body should be plain text with proper paragraph spacing and line breaks for readability (use '\\n' for newlines).
  End the email with a simple professional closing like "Best regards,". Do not include a placeholder for the sender's name like "[Your Name]".
  
  Example JSON format:
  {
    "subject": "Following up on your application",
    "body": "Hi ${applicant.name},\\n\\nI'm writing to..."
  }`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING },
                },
                required: ['subject', 'body'],
            }
        }
    });

    const responseText = response.text;
    if (!responseText) {
        throw new Error("AI did not return a valid response for custom email generation.");
    }
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (error) {
    console.error("Gemini email generation failed:", error);
    throw new Error("Failed to generate email content with AI. Please try a different prompt or write the email manually.");
  }
};