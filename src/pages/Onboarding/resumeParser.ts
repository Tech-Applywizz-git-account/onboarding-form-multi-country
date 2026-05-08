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
    dates: string;
    description: string;
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
  const parserUrl = import.meta.env.VITE_RESUME_PARSER_URL || "http://localhost:8000/parse";

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

  // Count how many fields were actually filled
  const filledCount = Object.values(parsed).filter(
    (v) => v !== null && v !== undefined && v !== "" && 
    !(Array.isArray(v) && v.length === 0)
  ).length;
  parsed._fields_filled = filledCount;

  return parsed;
}
