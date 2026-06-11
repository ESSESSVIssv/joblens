import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

  // Wait to initialize ai client when needed to avoid crash if env isn't provided
  let aiClient: GoogleGenAI | null = null;
  function getAI() {
    if (!aiClient) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  async function generateWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await ai.models.generateContent(params);
      } catch (err: any) {
        attempt++;
        const isBusyError = err.status === 503 || (err.message && (err.message.includes('503') || err.message.includes('high demand')));
        if (isBusyError && attempt < maxRetries) {
          console.warn(`Gemini API busy (503). Retrying attempt ${attempt}/${maxRetries} in ${attempt * 1500}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1500));
        } else {
          throw err;
        }
      }
    }
    throw new Error("Service temporarily unavailable after multiple retries.");
  }

  app.post("/api/resume-match", async (req, res) => {
    try {
      const { resumeText, resumePdf, jobDescription } = req.body;
      if ((!resumeText && !resumePdf) || !jobDescription) {
        return res.status(400).json({ error: "Missing resume or job description." });
      }

      const ai = getAI();
      
      const parts: any[] = [];
      if (resumePdf) {
        parts.push({ inlineData: { data: resumePdf, mimeType: "application/pdf" } });
        parts.push(`You are a professional career coach and ATS expert.\nAnalyze the attached PDF resume against the job description and respond ONLY in JSON format.\n\nJOB DESCRIPTION:\n${jobDescription}`);
      } else {
        parts.push(`You are a professional career coach and ATS expert.\nAnalyze this resume against the job description and respond ONLY in JSON format.\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`);
      }
      
      parts[parts.length - 1] += `\n\nAdditional Requirements:\n1. Compare the provided resume against the job description. List any critical skills, tools, or qualifications mentioned in the job description that are either absent or underdeveloped in the resume as "criticalGaps". Suggest how these gaps could be addressed, such as through further training or specific project experience as "recommendations".\n2. Identify key skills, qualifications, and experiences mentioned in the job description that are present in the resume. Suggest specific keywords and phrases from the job description that can be strategically integrated into the resume to enhance its ATS compatibility as "suggestedKeywords". Provide a revised section or bullet points with these optimizations as "revisedBullets".\n3. Act as a supportive career mentor. Write a direct, personalized message to the candidate explaining specifically why their background makes them a good fit for this role, providing encouragement and strategic advice on how to position themselves as "mentorExplanation".`;

      const response = await generateWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: parts,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.NUMBER },
              verdict: { type: Type.STRING },
              summary: { type: Type.STRING },
              matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              coverLetter: { type: Type.STRING },
              gapAnalysis: {
                type: Type.OBJECT,
                properties: {
                  criticalGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["criticalGaps", "recommendations"]
              },
              atsOptimization: {
                type: Type.OBJECT,
                properties: {
                  suggestedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  revisedBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["suggestedKeywords", "revisedBullets"]
              },
              jobTitle: { type: Type.STRING, description: "Extract the primary job title from the job description" },
              mentorExplanation: { type: Type.STRING, description: "Act as a supportive career mentor. Write a direct, personalized message to the candidate explaining specifically why their background makes them a good fit for this role, providing encouragement and strategic advice." }
            },
            required: [
              "matchScore", "verdict", "summary", "matchedSkills",
              "missingSkills", "strengths", "improvements", "coverLetter",
              "gapAnalysis", "atsOptimization", "jobTitle", "mentorExplanation"
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from model");
      }
      res.json(JSON.parse(text));
    } catch (err: any) {
      let errorMessage = err.message || "An error occurred.";
      const isBusy = err.status === 503 || errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('temporarily unavailable');
      if (isBusy) {
        console.warn("API Busy (503):", errorMessage);
        errorMessage = "The AI model is currently experiencing high demand. Please wait a moment and try again.";
        res.status(503).json({ error: errorMessage });
      } else {
        console.error("API Error:", err);
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  app.post("/api/job-finder", async (req, res) => {
    try {
      const { resumeText, resumePdf, jobTypePreference, userSelectedRoles } = req.body;
      if (!resumeText && !resumePdf) {
        return res.status(400).json({ error: "Missing resume." });
      }

      let extraInfo = "";
      if (jobTypePreference) {
        extraInfo += `\nJOB TYPE PREFERENCE: ${jobTypePreference}`;
      }

      const promptInstructions = `You are an AI Resume Analyser and Job Matching Assistant.
Your task is to:
1. Read and extract all information from the uploaded resume, including: Name, Contact details, Education, Skills, Technical skills, Certifications, Projects, Work experience, Internships, Achievements, and Preferred job roles.
2. Create a professional candidate profile based on the extracted information.
3. Search and identify relevant job opportunities across multiple platforms (simulate search for LinkedIn Jobs, Indeed, Naukri.com, Internshala, Foundit, and Company career pages).
4. Match jobs based on skills match percentage, education requirements, experience level, location preference, and internship/full-time preference.
5. Rank jobs from highest to lowest match score. Let the array index represent the ranking. Provide **AS MANY JOBS AS POSSIBLE (at least 20-30)** to give the user a comprehensive list of opportunities.
6. Provide specific fields for each job: Job Title, Company Name, Platform Source, Location, Match Percentage, Required Skills, Missing Skills, Salary (if available), Direct Apply Link (create a valid search link if direct is not possible, e.g. https://www.linkedin.com/jobs/search/?keywords=...), Application Deadline (if available, or 'Not specified').
7. CRITICAL: The job titles MUST be highly tailored to the exact roles, experiences, and core skills mentioned in the resume. Provide a balanced mix of relevant Internships and Full-Time Roles that directly match the user's specific trajectory and level of experience. Do not provide generic roles; make them highly specific to the candidate.
8. Categorize each job as: "Easy Apply (High Match)", "Moderate Match", or "Stretch Opportunity".
9. Suggest resume improvements that can increase the match score for each role.
10. Generate a brief tailored cover letter snippet or draft for each job matching their skills.
Output ONLY valid JSON matching the schema below. ${extraInfo}`;

      const ai = getAI();
      
      const parts: any[] = [];
      if (resumePdf) {
        parts.push({ inlineData: { data: resumePdf, mimeType: "application/pdf" } });
        parts.push(`Analyze the attached PDF resume.\n${promptInstructions}`);
      } else {
        parts.push(`Analyze this resume.\n\nRESUME:\n${resumeText}\n\n${promptInstructions}`);
      }

      const response = await generateWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: parts,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              profile: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  contact: { type: Type.STRING },
                  education: { type: Type.ARRAY, items: { type: Type.STRING } },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  experience: { type: Type.ARRAY, items: { type: Type.STRING } },
                  internships: { type: Type.ARRAY, items: { type: Type.STRING } },
                  achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  preferredRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  summary: { type: Type.STRING },
                },
                required: ["name", "contact", "education", "skills", "technicalSkills", "certifications", "projects", "experience", "internships", "achievements", "preferredRoles", "summary"]
              },
              jobs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    jobTitle: { type: Type.STRING },
                    company: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    location: { type: Type.STRING },
                    matchPercentage: { type: Type.NUMBER },
                    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    salary: { type: Type.STRING },
                    searchQueryLink: { type: Type.STRING },
                    deadline: { type: Type.STRING },
                    category: { type: Type.STRING },
                    resumeSuggestions: { type: Type.STRING },
                    coverLetter: { type: Type.STRING },
                  },
                  required: ["jobTitle", "company", "platform", "location", "matchPercentage", "requiredSkills", "missingSkills", "salary", "searchQueryLink", "deadline", "category", "resumeSuggestions", "coverLetter"]
                }
              }
            },
            required: ["profile", "jobs"],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from model");
      }
      res.json(JSON.parse(text));
    } catch (err: any) {
      let errorMessage = err.message || "An error occurred.";
      const isBusy = err.status === 503 || errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('temporarily unavailable');
      if (isBusy) {
        console.warn("API Busy (503):", errorMessage);
        errorMessage = "The AI model is currently experiencing high demand. Please wait a moment and try again.";
        res.status(503).json({ error: errorMessage });
      } else {
        console.error("API Error:", err);
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  // Vite middleware for development
  if (!process.env.VERCEL) {
    async function startServer() {
      if (process.env.NODE_ENV !== "production") {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
  }

export default app;
