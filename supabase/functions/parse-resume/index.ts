// supabase/functions/parse-resume/index.ts
// Server-side proxy: receives resume text from the browser, calls OpenAI securely.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return new Response(
        JSON.stringify({ error: "resumeText is required and must be a string." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured on server." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      return new Response(
        JSON.stringify({ error: err.error?.message || "OpenAI request failed." }),
        { status: openaiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await openaiRes.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response content from OpenAI." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message || "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
