import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import TryCatch from "../middlewares/trycatch.js";
import User from "../models/User.js";
import {
  buildResumePrompt,
  generateInterviewPrompt,
  JobMatcherPrompt,
  ResumeAnalyserPrompt,
} from "../config/prompt.js";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

// Smart Helper: Agar server busy (503) ho toh 2 second ruk kar dubara try karega
const callGeminiWithRetry = async (contents, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
      });
    } catch (err) {
      const isOverloaded =
        err?.status === 503 ||
        err?.message?.includes("503") ||
        err?.message?.includes("high demand");

      if (isOverloaded && i < retries - 1) {
        console.log(`Server busy, retrying in 2s... (Attempt ${i + 2})`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      throw err;
    }
  }
};

// Helper function: Gemini ke text response ko clean JSON mein badalne ke liye
const parseGeminiJSON = (response, res) => {
  const rawText = response.text?.replace(/```json|```/g, "").trim();

  if (!rawText) {
    res.status(500).json({ message: "AI returned empty response" });
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    res.status(500).json({
      message: "AI returned invalid JSON",
      rawResponse: response.text,
    });
    return null;
  }
};

// 1. ATS Resume Analyser
export const analyseResume = TryCatch(async (req, res) => {
  const { pdfBase64 } = req.body;
  if (!pdfBase64) {
    return res.status(400).json({ message: "PDF data is required" });
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const response = await callGeminiWithRetry([
    {
      role: "user",
      parts: [
        { text: ResumeAnalyserPrompt },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
          },
        },
      ],
    },
  ]);

  const jsonResponse = parseGeminiJSON(response, res);
  if (jsonResponse) res.json(jsonResponse);
});

// 2. Smart Job Matcher
export const jobMatcher = TryCatch(async (req, res) => {
  const { mode, skills, experience, pdfBase64 } = req.body;

  if (!mode) return res.status(400).json({ message: "Mode is required" });
  if (mode === "manual" && (!skills?.length || !experience?.trim())) {
    return res
      .status(400)
      .json({ message: "Skills and experience are required" });
  }
  if (mode === "resume" && !pdfBase64) {
    return res.status(400).json({ message: "PDF is required" });
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const parts = [{ text: JobMatcherPrompt(mode, skills, experience) }];
  if (mode === "resume") {
    parts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
      },
    });
  }

  const response = await callGeminiWithRetry([{ role: "user", parts }]);

  const jsonResponse = parseGeminiJSON(response, res);
  if (jsonResponse) res.json(jsonResponse);
});

// 3. Interview Preparation
export const generateInterview = TryCatch(async (req, res) => {
  const { mode, round, skills, experience, pdfBase64 } = req.body;

  if (!mode || !round) {
    return res.status(400).json({ message: "Mode and round are required" });
  }
  if (mode === "manual" && (!skills?.length || !experience?.trim())) {
    return res
      .status(400)
      .json({ message: "Skills and experience are required" });
  }
  if (mode === "resume" && !pdfBase64) {
    return res.status(400).json({ message: "PDF is required" });
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const parts = [
    { text: generateInterviewPrompt(round, mode, skills, experience) },
  ];
  if (mode === "resume") {
    parts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
      },
    });
  }

  const response = await callGeminiWithRetry([{ role: "user", parts }]);

  const jsonResponse = parseGeminiJSON(response, res);
  if (jsonResponse) res.json(jsonResponse);
});

// 4. AI Resume Builder
export const buildResume = TryCatch(async (req, res) => {
  const { mode, formData, pdfBase64 } = req.body;

  if (!mode) return res.status(400).json({ message: "Mode is required" });
  if (mode === "manual" && !formData) {
    return res.status(400).json({ message: "Form data is required" });
  }
  if (mode === "improve" && !pdfBase64) {
    return res.status(400).json({ message: "PDF is required" });
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const parts = [{ text: buildResumePrompt(mode, formData) }];
  if (mode === "improve") {
    parts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
      },
    });
  }

  const response = await callGeminiWithRetry([{ role: "user", parts }]);

  const jsonResponse = parseGeminiJSON(response, res);
  if (jsonResponse) res.json(jsonResponse);
});
