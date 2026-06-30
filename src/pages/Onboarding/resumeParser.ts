// src/pages/Onboarding/resumeParser.ts
// Extracts text from PDF/DOCX and uses OpenAI to parse resume into structured form data

// ─── PDF Text Extraction ────────────────────────────────────────────────────

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    return extractTextFromPDF(file);
  } else if (ext === "docx") {
    return extractTextFromDOCX(file);
  } else if (ext === "txt" || ext === "rtf") {
    return file.text();
  }

  throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Dynamically import pdf-parse-new to avoid early resolution errors
  const pdfParse = (await import("pdf-parse-new")).default;
  
  // Convert ArrayBuffer to Node Buffer for pdf-parse-new
  let buffer;
  if (typeof Buffer !== "undefined") {
    buffer = Buffer.from(arrayBuffer);
  } else {
    const { Buffer: PolyBuffer } = await import("buffer");
    buffer = PolyBuffer.from(arrayBuffer);
  }
  
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const mammoth = await import("mammoth");
  
  // Use HTML conversion to preserve bold formatting
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  const html = htmlResult.value;
  
  // Convert HTML to text with [BOLD] markers for bold content
  // Replace <strong> and <b> tags with [BOLD] markers
  let text = html
    .replace(/<strong>/gi, '[BOLD]')
    .replace(/<\/strong>/gi, '[/BOLD]')
    .replace(/<b>/gi, '[BOLD]')
    .replace(/<\/b>/gi, '[/BOLD]')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '') // Remove remaining HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n'); // Clean up excessive newlines
  
  return text;
}

// ─── OpenAI Resume Parsing ────────────────────────────────────────────────────

export interface ParsedResumeData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  personal_email?: string;
  primary_phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  other_links?: string[];
  full_address?: string;
  education_history?: Array<{
    degree: string;
    university: string;
    subject: string;
    dates: string;
  }>;
  employment_history?: Array<{
    job_title: string;
    company_name: string;
    dates?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
  }>;
  skills?: string[];
  projects_list?: Array<{
    title: string;
    organization: string;
    duration: string;
    description: string;
  }>;
  certifications?: string[];
  predicted_job_title?: string;
  confidence_score?: number;
  _fields_filled?: number;
}

export async function parseResumeViaRoute(file: File): Promise<ParsedResumeData> {
  const parserUrl = import.meta.env.VITE_RESUME_PARSER_URL || "https://resume-parser-without-ai.onrender.com/parse";
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // 1. Backend API Fallback Logic
  const fallbackToRenderAPI = async (): Promise<ParsedResumeData> => {
    console.log("Using backend parser route: " + parserUrl);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(parserUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Resume parsing request failed" }));
      throw new Error(error.error || "Resume parsing request failed");
    }

    const parsed: ParsedResumeData = await response.json();
    console.log("Successfully parsed from backend route.");

    if (parsed.employment_history && parsed.employment_history.length > 0) {
      for (let i = 0; i < parsed.employment_history.length - 1; i++) {
        const current = parsed.employment_history[i];
        const next = parsed.employment_history[i + 1];
        const hasTitleCompany = current.job_title && current.company_name;
        const missingDates = !current.dates && !current.start_date && !current.end_date;
        const nextHasDates = next.dates || next.start_date || next.end_date;
        const nextMissingCompany = !next.company_name || next.company_name.trim() === "";
        
        if (hasTitleCompany && missingDates && nextHasDates && nextMissingCompany) {
          current.dates = next.dates;
          current.start_date = next.start_date;
          current.end_date = next.end_date;
          current.description = next.description || current.description;
          next.job_title = "";
        }
      }

      const cleanJobTitle = (title: string): string => {
        if (!title) return "";
        let t = title.trim();
        t = t.replace(/^[•\-▪○*►▸◦‣⁃\s]+/, "");
        if (t.length > 100) t = t.substring(0, 100);
        return t;
      };

      const cleanCompanyName = (name: string): string => {
        if (!name) return "";
        let n = name.trim();
        n = n.replace(/^[•\-▪○*►▸◦‣⁃\s]+/, "");
        if (n.length > 100) n = n.substring(0, 100);
        return n;
      };

      parsed.employment_history = parsed.employment_history.map(job => ({
        ...job,
        job_title: cleanJobTitle(job.job_title),
        company_name: cleanCompanyName(job.company_name)
      })).filter(job => job.job_title || job.company_name);
    }

    const filledCount = Object.values(parsed).filter(
      (v) => v !== null && v !== undefined && v !== "" && 
      !(Array.isArray(v) && v.length === 0)
    ).length;
    parsed._fields_filled = filledCount;

    return parsed;
  };

  // 2. Expert OpenAI Parsing Logic
  const useOpenAI = async (): Promise<ParsedResumeData> => {
    console.log("Using direct client-side OpenAI parsing (Expert Mode)...");
    const text = await extractTextFromFile(file);
    
    const prompt = `You are an expert resume parser. Extract the following information from the resume text below and return a JSON object.

IMPORTANT RULES:
- Identify every education entry separately.
- Identify every work experience separately.
- Extract company name, job title, location, start date, end date, and responsibilities.
- Ignore bullet points when determining company names.
- Never invent missing information.
- Return empty strings or empty arrays for missing fields.
- Return ONLY valid JSON with no markdown wrapping.

Return ONLY valid JSON with these exact keys:
{
  "first_name": "string",
  "middle_name": "string",
  "last_name": "string",
  "personal_email": "string",
  "primary_phone": "string (include country code with + prefix)",
  "full_address": "string",
  "linkedin_url": "string",
  "github_url": "string",
  "portfolio_url": "string",
  "date_of_birth": "string",
  "highest_education": "string",
  "university_name": "string",
  "main_subject": "string",
  "graduation_year": "string",
  "cgpa": "string",
  "experience": "string (total years)",
  "employment_status": "string",
  "employment_history": [
    {
      "job_title": "string",
      "company_name": "string",
      "location": "string",
      "start_date": "string (MM/DD/YYYY)",
      "end_date": "string (MM/DD/YYYY, or 'Present')",
      "is_current": "boolean",
      "description": "string"
    }
  ],
  "predicted_job_title": "string"
}

Resume Text:
---
${text.slice(0, 8000)}
---`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI direct completions request failed");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("Empty OpenAI response content");

    const parsed: ParsedResumeData = JSON.parse(content);
    
    // Clean up markers
    if (parsed.employment_history && parsed.employment_history.length > 0) {
      parsed.employment_history = parsed.employment_history.map(job => ({
        ...job,
        job_title: job.job_title?.replace(/\[\/?(BOLD)\]/g, "").trim() || "",
        company_name: job.company_name?.replace(/\[\/?(BOLD)\]/g, "").trim() || "",
      }));
    }
    
    const filledCount = Object.values(parsed).filter(
      (v) => v !== null && v !== undefined && v !== "" && 
      !(Array.isArray(v) && v.length === 0)
    ).length;
    parsed._fields_filled = filledCount;
    
    return parsed;
  };

  // 3. Execution Priority
  if (apiKey) {
    try {
      return await useOpenAI();
    } catch (err: any) {
      console.error("🚨 OPENAI API FAILED, falling back to Render API 🚨", err.message || err);
      return await fallbackToRenderAPI();
    }
  } else {
    return await fallbackToRenderAPI();
  }
}
