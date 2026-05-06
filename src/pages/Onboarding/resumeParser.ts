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

  // Dynamically import pdfjs-dist to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist");

  // Set the worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n");
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ─── OpenAI Resume Parsing ────────────────────────────────────────────────────

export interface ParsedResumeData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  personal_email?: string;
  primary_phone?: string;
  full_address?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  date_of_birth?: string;

  // Education
  highest_education?: string;
  university_name?: string;
  main_subject?: string;
  graduation_year?: string;
  cgpa?: string;

  // Work
  experience?: string;
  employment_status?: "Employed" | "Unemployed";
  employment_history?: Array<{
    job_title: string;
    company_name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
  }>;
  job_role_preferences?: string[];

  // Misc
  gender?: string;
  _fields_filled?: number;
}

export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not configured.");
  }

  const prompt = `You are a resume parser. Extract the following information from the resume text below and return a JSON object.

Return ONLY valid JSON with these exact keys (omit keys where info is not found):
{
  "first_name": "string",
  "middle_name": "string or null",
  "last_name": "string",
  "personal_email": "string",
  "primary_phone": "string (include country code with + prefix, e.g. +14155552671)",
  "full_address": "string (full address if available)",
  "linkedin_url": "string (full URL, e.g. https://linkedin.com/in/username)",
  "github_url": "string (full URL, e.g. https://github.com/username)",
  "portfolio_url": "string (full URL, e.g. https://username.com)",
  "date_of_birth": "string (YYYY-MM-DD format if found)",
  "highest_education": "one of: High School Diploma / GED, Associate Degree, Bachelor's Degree, Master's Degree, Doctorate / PhD, Other",
  "university_name": "string",
  "main_subject": "string (major/minor)",
  "graduation_year": "string (4-digit year)",
  "cgpa": "string (GPA or percentage)",
  "experience": "string (total years as a number, e.g. '3')",
  "employment_status": "one of: Employed, Unemployed",
  "employment_history": [
    {
      "job_title": "string",
      "company_name": "string",
      "start_date": "string (YYYY-MM format)",
      "end_date": "string (YYYY-MM format, or empty if current)",
      "is_current": boolean
    }
  ],
  "job_role_preferences": ["string array of job titles/roles from resume"],
  "gender": "one of: Male, Female, Non-binary, null"
}

Important rules for extraction accuracy:
1. PERSONAL INFO:
   - "primary_phone": Always search for a country code (like +44 for UK, +1 for USA, +91 for India). Return in digits-only after the + prefix.
   - "linkedin_url": Extract the full LinkedIn URL ONLY if a real URL or a specific LinkedIn handle is found in the text. If no link is found, return null. Do NOT use placeholder text like "username".
   - "github_url": Extract the full GitHub URL ONLY if it exists. Return null otherwise.
   - "portfolio_url": Extract the full URL ONLY if it exists. Return null otherwise.
   - "full_address": Include city, state/province, and country if present (e.g., "Croydon, GLN, UK").

2. EDUCATION MAPPING (STRICT):
   - "Masters in..." or "MSc" or "Master of..." -> "Master's Degree"
   - "Bachelor of..." or "BSc" or "B.Tech" or "BE" -> "Bachelor's Degree"
   - "Doctor of..." or "PhD" -> "Doctorate / PhD"
   - "Associate of..." -> "Associate Degree"
   - "High School..." -> "High School Diploma / GED"
   - Graduation Year: Extract only the 4-digit year of completion.

3. WORK EXPERIENCE:
   - "experience": Calculate total years of experience across all jobs. If the summary says "3+ years", use "3". 
   - "employment_history": Extract every job. 
   - Dates: Use YYYY-MM format. If it says "Present", set is_current: true and end_date: null or "".
   - Job Titles: Clean them (e.g., "Azure DevOps Engineer" instead of just "Engineer").

4. JOB ROLE PREFERENCES:
   - Identify the candidate's core roles from their current title and professional summary.

5. OUTPUT:
   - Return ONLY valid JSON. Omit keys where data is truly missing.
   - Do NOT use "Other" for education if it matches any of the categories above.

Resume Text:
---
${resumeText.slice(0, 8000)}
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
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API request failed");
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) throw new Error("No response from OpenAI");

  const parsed: ParsedResumeData = JSON.parse(content);

  // Count how many fields were actually filled
  const filledCount = Object.values(parsed).filter(
    (v) => v !== null && v !== undefined && v !== "" && 
    !(Array.isArray(v) && v.length === 0)
  ).length;
  parsed._fields_filled = filledCount;

  return parsed;
}
