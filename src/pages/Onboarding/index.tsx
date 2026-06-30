import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, LogOut } from "lucide-react";
import { Navbar } from "@/components/Navbar";

// Schema & Constants
import { schema, FormVals } from "./schema";
import { slugify, fileExt, ensureAllowedDoc, ynToBool, parseDobToDate } from "./helpers";
import { jobRoleOptions } from "./constants";

// Step Components
import { Step1Personal } from "./components/Step1Personal";
import { Step2Eligibility } from "./components/Step2Eligibility";
import { Step3Education } from "./components/Step3Education";
import { Step4Background } from "./components/Step4Background";
import { Step5Demographics } from "./components/Step5Demographics";
import { Step6Review } from "./components/Step6Review";
import { ParsedResumeData, parseResumeViaRoute } from "./resumeParser";

const FIELD_LABELS: Record<string, string> = {
  first_name: "First Name",
  last_name: "Last Name",
  personal_email: "Email Address",
  company_email: "Job Application Email",
  primary_phone: "Primary Phone",
  whatsapp_number: "WhatsApp Number",
  full_address: "Full Address",
  visatype: "Visa Type",
  visatype_other: "Other Visa Type",
  date_of_birth: "Date of Birth",
  zip_or_country: "Country",
  resume_dummy: "Resume/CV Attachment",
  is_over_18: "Age Eligibility",
  eligible_to_work_in_us: "Work Eligibility",
  authorized_without_visa: "Visa Authorization",
  require_future_sponsorship: "Sponsorship Needs",
  can_perform_essential_functions: "Essential Functions",
  discharged_for_policy_violation: "Policy Violation",
  referred_by_agency: "Agency Referral",
  highest_education: "Highest Education",
  university_name: "University Name",
  main_subject: "Major/Minor",
  graduation_year: "Graduation Year",
  cgpa: "GPA/Percentage",
  desired_start_date: "Desired Start Date",
  willing_to_relocate: "Willingness to Relocate",
  can_work_3_days_in_office: "In-office Availability",
  salary_expectations_yearly: "Salary Expectations (Yearly)",
  salary_expectations_hourly: "Salary Expectations (Hourly)",
  role: "Job Role",
  experience: "Experience Level",
  work_preferences: "Work Preferences",
  job_role_preferences: "Job Role Preference",
  job_role_other: "Preferred Job Role (Other)",
  location_preferences: "Location Preference",
  willing_to_travel: "Willingness to Travel",
  notice_period: "Notice Period",
  employment_status: "Employment Status",
  employment_history: "Employment History",
  convicted_of_felony: "Felony Record",
  pending_investigation: "Pending Investigation",
  willing_background_check: "Background Check",
  willing_drug_screen: "Drug Screen",
  failed_or_refused_drug_test: "Drug Test History",
  uses_substances_affecting_duties: "Substance Use",
  can_provide_legal_docs: "Legal Documentation",
  gender: "Gender",
  gender_other: "Other Gender",
  pronouns: "Pronoun",
  pronouns_other: "Other Pronouns",
  religion: "Religion",
  religion_other: "Other Religion",
  is_hispanic_latino: "Hispanic/Latino Status",
  race_ethnicity: "Race/Ethnicity",
  race_ethnicity_other: "Other Race / Ethnicity",
  veteran_status: "Veteran Status",
  disability_status: "Disability Status",
  financial_licenses: "Financial Services Industry Licenses",
  current_country_timezone: "Current Country & Timezone",
  current_country_timezone_other: "Other Country & Timezone",
  province_territory: "Province / Territory",
  province_territory_other: "Other Province / Territory / State",
  county: "County",
  county_other: "Other County",
};

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifiedUser, resumeFile, setResumeFile, videoUrl, logout } = useAuth();
  const verified = verifiedUser;

  // Safety redirect if someone bypasses ProtectedRoute (shouldn't happen)
  useEffect(() => {
    if (!verified) {
      navigate("/", { replace: true });
    } else if (!videoUrl) {
      navigate("/video-validation", { replace: true });
    }
  }, [verified, videoUrl, navigate]);

  // Local State
  const [step, setStep] = useState(1);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChancesDialog, setShowChancesDialog] = useState(false);
  const [remainingChances, setRemainingChances] = useState<number | null>(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressValue, setAddressValue] = useState("");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  if (!verified) return null; // Prevent rendering with null data

  // Job Roles API State
  const [jobRolesData, setJobRolesData] = useState<any[]>([]);
  const [jobRolesLoading, setJobRolesLoading] = useState(false);
  const [alternateRolesOptions, setAlternateRolesOptions] = useState<string[]>([]);
  const lastJobRoleRef = useRef<string>("");

  // Form Initialization
  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      // Step 1
      first_name: "",
      middle_name: "",
      last_name: "",
      personal_email: "",
      company_email: "",
      primary_phone: "+",
      callable_phone: "+",
      whatsapp_number: "+",
      address_line1: "",
      address_line2: "",
      city: "",
      state_province: "",
      zip_postal_code: "",
      full_address: "",
      zip_or_country: "",
      visatype: "",
      visatype_other: "",
      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
      addons_notes: "",
      resume_dummy: "",
      date_of_birth: "",

      // Step 2
      is_over_18: "yes",
      eligible_to_work_in_us: "yes",
      authorized_without_visa: "yes",
      require_future_sponsorship: "no",
      can_perform_essential_functions: "yes",
      discharged_for_policy_violation: "no",
      referred_by_agency: "no",

      // Step 3
      highest_education: "",
      university_name: "",
      main_subject: "",
      graduation_year: "",
      cgpa: "",
      desired_start_date: "",
      willing_to_relocate: "yes",
      can_work_3_days_in_office: "no",
      salary_expectations_yearly: "",
      salary_expectations_hourly: "",
      salary_period: "Yearly",
      role: "",
      experience: "",
      work_preferences: [],
      alternate_job_roles: "",
      has_alternates_available: false,
      exclude_companies: ["NA"],
      job_role_preferences: [],
      job_role_other: "",
      location_preferences: [],
      willing_to_travel: "yes",
      notice_period: "",
      employment_status: "Unemployed",
      employment_history: [],

      // Step 4
      convicted_of_felony: "no",
      felony_explanation: "",
      pending_investigation: "no",
      willing_background_check: "yes",
      willing_drug_screen: "yes",
      failed_or_refused_drug_test: "no",
      uses_substances_affecting_duties: "no",
      substances_description: "",
      can_provide_legal_docs: "yes",

      // Step 5
      gender: "",
      pronouns: "",
      sexual_orientation: "",
      religion: "",
      is_hispanic_latino: "",
      race_ethnicity: "",
      veteran_status: "",
      disability_status: "",
      current_country_timezone: "",
      province_territory: "",
      county: "",

      // Step 6
      terms_accepted: false,

      // Metadata
      form_filled_link: typeof window !== 'undefined' ? window.location.href : '',
      form_status: typeof window !== 'undefined' ?
        (window.location.href === 'https://onboardingform.apply-wizz.me/onboarding' ? 'CORRECT' : 'DIFFERENT') :
        'DIFFERENT',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
    control,
  } = form;

  const { replace: replaceEmployment } = useFieldArray({
    control,
    name: "employment_history",
  });

  const jobRoles = watch("job_role_preferences") || [];

  // Fetch Job Roles
  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        setJobRolesLoading(true);
        const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || "https://dashboard.apply-wizz.com";
        const response = await fetch(`${dashboardUrl}/api/all-job-roles`);
        if (!response.ok) throw new Error("Failed to fetch job roles");
        const data = await response.json();

        const filteredData = data.map((role: any) => ({
          ...role,
          alternateRoles: role.alternateRoles?.filter((altRole: string) =>
            !altRole.includes(',') && !altRole.toLowerCase().includes('for')
          ) || []
        })).filter((role: any) =>
          !role.name.includes(',') && !role.name.toLowerCase().includes('for')
        );

        setJobRolesData(filteredData);
      } catch (error) {
        toast({
          title: "Failed to load job roles",
          description: "Using default job roles. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setJobRolesLoading(false);
      }
    };
    fetchJobRoles();
  }, [toast]);

  // Check Submission Chances
  useEffect(() => {
    (async () => {
      if (!verified.applywizz_id) return;
      const { data, error } = await supabase
        .from("client_onborading_details")
        .select("no_of_times_form_filled")
        .eq("lead_id", verified.applywizz_id)
        .maybeSingle();
      if (!error) {
        const count = data?.no_of_times_form_filled ?? 0;
        const remaining = Math.max(0, 2 - count);
        setRemainingChances(remaining);
        setShowChancesDialog(true);
      }
    })();
  }, [verified.applywizz_id]);

  // Removed clear resumeFile on mount so it persists from ResumeUpload

  // Sync Resume Dummy Field for Validation
  useEffect(() => {
    setValue("resume_dummy", resumeFile ? "yes" : "");
    if (resumeFile) {
      localStorage.setItem("last_uploaded_resume_name", resumeFile.name);
    }
  }, [resumeFile, setValue]);

  const primaryPhone = watch("primary_phone");
  const firstName = watch("first_name");
  const lastName = watch("last_name");

  // Auto-generate Job Application Email (company_email)
  useEffect(() => {
    const cleanFirst = (firstName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLast = (lastName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanFirst || cleanLast) {
      setValue("company_email", `${cleanFirst}${cleanLast}@applywizard.ai`, { shouldValidate: true });
    }
  }, [firstName, lastName, setValue]);

  // Automatic Country Selection based on Phone Prefix
  useEffect(() => {
    if (!primaryPhone) return;

    const phonePrefixToCountry: Record<string, string> = {
      "+1": "United States",
      "+44": "United Kingdom",
      "+353": "Ireland",
      "+91": "India",
    };

    // Find the longest matching prefix
    const matchingPrefix = Object.keys(phonePrefixToCountry)
      .sort((a, b) => b.length - a.length)
      .find(prefix => primaryPhone.startsWith(prefix));

    if (matchingPrefix) {
      const country = phonePrefixToCountry[matchingPrefix];
      // Only set if not already set or if it's currently empty to avoid overwriting user manual choice
      const currentCountry = watch("zip_or_country");
      if (!currentCountry) {
        setValue("zip_or_country", country, { shouldValidate: true });
      }
    }
  }, [primaryPhone, setValue, watch]);

  const applyParsedData = useCallback((parsedData: ParsedResumeData) => {
        // Helper to ensure parsed URLs have https:// prefix
        const formatUrl = (url?: string) => {
          if (!url) return "";
          let cleaned = url.trim();
          if (cleaned && !cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
            cleaned = "https://" + cleaned;
          }
          return cleaned;
        };

        // 1. Basic Info
        if (parsedData.first_name) setValue("first_name", parsedData.first_name, { shouldValidate: true });
        if (parsedData.middle_name) setValue("middle_name", parsedData.middle_name, { shouldValidate: true });
        if (parsedData.last_name) setValue("last_name", parsedData.last_name, { shouldValidate: true });
        if (parsedData.personal_email) setValue("personal_email", parsedData.personal_email, { shouldValidate: true });
        
        if (parsedData.primary_phone) {
          let cleanedPhone = parsedData.primary_phone.replace(/[^\d+]/g, ""); // Keep only digits and +
          if (cleanedPhone && !cleanedPhone.startsWith("+")) {
            cleanedPhone = "+" + cleanedPhone;
          }
          if (cleanedPhone && cleanedPhone.length > 2 && /^\+[0-9]+$/.test(cleanedPhone)) {
            setValue("primary_phone", cleanedPhone, { shouldValidate: true });
            setValue("whatsapp_number", cleanedPhone, { shouldValidate: true });
          }
        }

        if (parsedData.linkedin_url) setValue("linkedin_url", formatUrl(parsedData.linkedin_url), { shouldValidate: true });
        if (parsedData.github_url) setValue("github_url", formatUrl(parsedData.github_url), { shouldValidate: true });
        if (parsedData.portfolio_url) setValue("portfolio_url", formatUrl(parsedData.portfolio_url), { shouldValidate: true });

        // 2. Education History (Map first entry to single fields)
        if (parsedData.education_history && parsedData.education_history.length > 0) {
          const edu = parsedData.education_history[0];
          setValue("university_name", edu.university, { shouldValidate: true });
          setValue("main_subject", edu.subject, { shouldValidate: true });

          // Map degree to highest_education options
          const degree = edu.degree?.toLowerCase() || "";
          let mappedEdu = "Other";
          if (degree.includes("bachelor") || degree.includes("b.s") || degree.includes("b.a")) mappedEdu = "Bachelor’s Degree";
          else if (degree.includes("master") || degree.includes("m.s") || degree.includes("m.a") || degree.includes("mba")) mappedEdu = "Master’s Degree";
          else if (degree.includes("doctor") || degree.includes("phd") || degree.includes("ph.d")) mappedEdu = "Doctorate / PhD";
          else if (degree.includes("associate")) mappedEdu = "Associate Degree";
          else if (degree.includes("high school") || degree.includes("ged")) mappedEdu = "High School Diploma / GED";

          setValue("highest_education", mappedEdu, { shouldValidate: true });

          // Extract graduation year from dates (e.g., "01-08-2022 - 01-05-2024")
          if (edu.dates) {
            const yearMatch = edu.dates.match(/(\d{4})$/);
            if (yearMatch) {
              setValue("graduation_year", yearMatch[1], { shouldValidate: true });
            }
          }
        }

        // 3. Employment History
        if (parsedData.employment_history && parsedData.employment_history.length > 0) {
          // Helper to normalize a date string to MM/YYYY format
          const normalizeToMMYYYY = (dStr: string): string => {
            if (!dStr) return "";
            const cleaned = dStr.trim();
            if (cleaned.toLowerCase().includes("present") || cleaned.toLowerCase().includes("current")) return "";

            // Already in MM/YYYY format — pass through directly
            if (/^(0[1-9]|1[0-2])\/\d{4}$/.test(cleaned)) {
              return cleaned;
            }
            
            // If it is MM/DD/YYYY, convert to MM/YYYY
            if (/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(cleaned)) {
              const parts = cleaned.split('/');
              return `${parts[0]}/${parts[2]}`;
            }

            // Month name + year (e.g. "May 2021", "January 2023")
            const monthMatch = cleaned.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i);
            const yearMatch = cleaned.match(/\b(19|20)\d{2}\b/);
            
            if (monthMatch && yearMatch) {
              const parsedDate = new Date(`${monthMatch[0]} 1, ${yearMatch[0]}`);
              if (!isNaN(parsedDate.getTime())) {
                const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
                return `${mm}/${yearMatch[0]}`;
              }
            }

            // Numeric date parts (e.g. "05/2021", "2021-05", "05-01-2021")
            const parts = cleaned.split(/[-/.,\s]+/);
            if (parts.length >= 2) {
              const yearIndex = parts.findIndex(p => p.length === 4 && /^\d{4}$/.test(p));
              if (yearIndex !== -1) {
                const yyyy = parts[yearIndex];
                let mm = "";
                
                if (parts.length >= 3) {
                  // Could be MM/DD/YYYY or DD/MM/YYYY
                  const p0 = parseInt(parts[0], 10);
                  const p1 = parseInt(parts[1], 10);
                  if (!isNaN(p0) && !isNaN(p1)) {
                    if (p0 > 12 && p1 <= 12) mm = parts[1];
                    else if (p1 > 12 && p0 <= 12) mm = parts[0];
                    else if (yearIndex === 2) mm = parts[0]; // US format MM/DD/YYYY
                    else if (yearIndex === 0) mm = parts[1]; // YYYY/MM/DD
                  }
                } else {
                  // MM/YYYY or YYYY/MM
                  mm = yearIndex > 0 ? parts[yearIndex - 1] : parts[yearIndex + 1];
                }

                const mNum = parseInt(mm, 10);
                if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
                  return `${String(mNum).padStart(2, '0')}/${yyyy}`;
                }
              }
            }

            // Fallback: try standard Date parsing
            if (yearMatch) return `01/${yearMatch[0]}`;
            return dStr;
          };

          const normalizedHistory = parsedData.employment_history.map(job => {
            let start_date = "";
            let end_date = "";
            let is_current = !!job.is_current;

            // Priority 1: Use direct start_date/end_date fields (from improved OpenAI prompt)
            if (job.start_date) {
              start_date = normalizeToMMYYYY(job.start_date);
            }
            if (job.end_date) {
              if (job.end_date.toLowerCase().includes("present") || job.end_date.toLowerCase().includes("current")) {
                is_current = true;
                end_date = "";
              } else {
                end_date = normalizeToMMYYYY(job.end_date);
              }
            }

            // Priority 2: Fallback to combined "dates" string if direct fields are empty
            if (!start_date && job.dates) {
              const dateParts = job.dates.split(/\s*(?:[-–—]|to|till|until)\s*/i).filter(Boolean);
              if (dateParts.length > 0) {
                start_date = normalizeToMMYYYY(dateParts[0]);
                if (dateParts.length > 1) {
                  if (dateParts[1].toLowerCase().includes("present") || dateParts[1].toLowerCase().includes("current")) {
                    is_current = true;
                    end_date = "";
                  } else {
                    end_date = normalizeToMMYYYY(dateParts[1]);
                  }
                }
              }
            }

            return {
              job_title: job.job_title,
              company_name: job.company_name,
              start_date: start_date,
              end_date: is_current ? "" : end_date,
              is_current: is_current
            };
          });
          replaceEmployment(normalizedHistory);

          // Also set experience if possible (count years from start_date/end_date)
          let totalMonths = 0;
          normalizedHistory.forEach(job => {
            if (job.start_date) {
              // Parse MM/YYYY format
              const startParts = job.start_date.split("/");
              if (startParts.length === 2) {
                const startMonth = parseInt(startParts[0], 10);
                const startYear = parseInt(startParts[1], 10);
                
                let endMonth: number, endYear: number;
                if (job.is_current || !job.end_date) {
                  const now = new Date();
                  endMonth = now.getMonth() + 1;
                  endYear = now.getFullYear();
                } else {
                  const endParts = job.end_date.split("/");
                  if (endParts.length === 2) {
                    endMonth = parseInt(endParts[0], 10);
                    endYear = parseInt(endParts[1], 10);
                  } else {
                    return;
                  }
                }
                
                if (!isNaN(startYear) && !isNaN(endYear) && !isNaN(startMonth) && !isNaN(endMonth)) {
                  totalMonths += (endYear - startYear) * 12 + (endMonth - startMonth);
                }
              }
            }
          });
          const expYears = Math.max(1, Math.floor(totalMonths / 12));
          setValue("experience", expYears.toString(), { shouldValidate: true });

          // Also set first role
          if (normalizedHistory[0]?.job_title) {
            setValue("role", normalizedHistory[0].job_title, { shouldValidate: true });
          }

          // Auto-set employment status to "Employed" when employment history is available
          if ((parsedData as any).employment_status === "Employed" || normalizedHistory.length > 0) {
            setValue("employment_status", "Employed", { shouldValidate: true });
          }
        }

        // 4. Address Auto-fill Bypass (Removed as requested to force manual suggestions)

        // 5. Certifications & Projects -> Addons
        let addons = "";
        if (parsedData.certifications && parsedData.certifications.length > 0) {
          addons += `Certifications: ${parsedData.certifications.join(", ")}\n`;
        }
        if (parsedData.projects_list && parsedData.projects_list.length > 0) {
          addons += `Projects: ${parsedData.projects_list.map(p => p.title).join(", ")}`;
        }
        if (addons) setValue("addons_notes", addons.trim(), { shouldValidate: true });

        // 5. Predicted Role
        if (parsedData.predicted_job_title) {
          setValue("job_role_preferences", [parsedData.predicted_job_title], { shouldValidate: true });
        }

        toast({
          title: "Profile Auto-filled",
          description: "We've applied the data from your resume. Please review each step.",
        });
  }, [setValue, replaceEmployment, toast]);

  // Check for Parsed Resume Data in localStorage on mount
  useEffect(() => {
    const rawData = localStorage.getItem("resume_parsed_data");
    if (rawData) {
      try {
        const parsedData: ParsedResumeData = JSON.parse(rawData);
        applyParsedData(parsedData);
      } catch (e) {
        console.error("Failed to parse localStorage resume data", e);
      }
    }
  }, [applyParsedData]);

  // Parse Resume if uploaded directly in Step 1
  useEffect(() => {
    const parseNewResume = async () => {
      if (!resumeFile) return;
      
      const lastParsedName = localStorage.getItem("last_uploaded_resume_name");
      if (lastParsedName === resumeFile.name) return; // Already parsed

      try {
        setIsParsing(true);
        const parsedData = await parseResumeViaRoute(resumeFile);
        if (parsedData) {
          localStorage.setItem("resume_parsed_data", JSON.stringify(parsedData));
          localStorage.setItem("last_uploaded_resume_name", resumeFile.name);
          applyParsedData(parsedData);
        }
      } catch (error) {
        console.error("Failed to parse resume dynamically:", error);
        toast({
          title: "Parsing Failed",
          description: "Could not auto-fill form. Please enter manually.",
          variant: "destructive",
        });
      } finally {
        setIsParsing(false);
      }
    };
    
    parseNewResume();
  }, [resumeFile, applyParsedData, toast]);

  // Handle Job Role Auto-mapping and Reset Alternates
  useEffect(() => {
    const currentJobRole = jobRoles && jobRoles.length > 0 ? jobRoles[0] : "";
    if (currentJobRole) {
      lastJobRoleRef.current = currentJobRole;
      setValue("role", currentJobRole, { shouldValidate: true });

      const selectedRole = jobRolesData.find(role => role.name === currentJobRole);
      if (selectedRole && selectedRole.alternateRoles && selectedRole.alternateRoles.length > 0) {
        setAlternateRolesOptions(selectedRole.alternateRoles);
        setValue("has_alternates_available", true, { shouldValidate: true });

        // Auto-select ALL alternate roles as requested
        setValue("alternate_job_roles", selectedRole.alternateRoles.join(","), { shouldValidate: true });
      } else {
        setAlternateRolesOptions([]);
        setValue("has_alternates_available", false, { shouldValidate: true });
        setValue("alternate_job_roles", "", { shouldValidate: true });
      }
    } else {
      setAlternateRolesOptions([]);
      setValue("has_alternates_available", false, { shouldValidate: true });
      setValue("alternate_job_roles", "", { shouldValidate: true });
    }
  }, [jobRoles, jobRolesData, setValue]);


  const stepFieldMap: Record<number, (keyof FormVals)[]> = {
    1: ["first_name", "last_name", "personal_email", "company_email", "primary_phone", "whatsapp_number", "address_line1", "address_line2", "city", "state_province", "zip_postal_code", "full_address", "visatype", "visatype_other", "date_of_birth", "zip_or_country", "resume_dummy"],
    2: ["is_over_18", "eligible_to_work_in_us", "authorized_without_visa", "require_future_sponsorship", "can_perform_essential_functions", "discharged_for_policy_violation", "referred_by_agency"],
    3: ["highest_education", "university_name", "main_subject", "graduation_year", "cgpa", "desired_start_date", "willing_to_relocate", "can_work_3_days_in_office", "salary_expectations_yearly", "salary_expectations_hourly", "salary_period", "role", "experience", "work_preferences", "job_role_preferences", "job_role_other", "location_preferences", "willing_to_travel", "notice_period", "employment_status", "employment_history", "alternate_job_roles", "has_alternates_available"],
    4: ["convicted_of_felony", "felony_explanation", "pending_investigation", "willing_background_check", "willing_drug_screen", "failed_or_refused_drug_test", "uses_substances_affecting_duties", "substances_description", "can_provide_legal_docs"],
    5: ["gender", "gender_other", "pronouns", "pronouns_other", "religion", "religion_other", "is_hispanic_latino", "race_ethnicity", "race_ethnicity_other", "veteran_status", "disability_status", "current_country_timezone", "current_country_timezone_other", "province_territory", "province_territory_other", "county", "county_other"],
    6: [],
  };

  const prevStep = () => {
    if (step === 1) {
      navigate("/resume-upload");
      return;
    }
    if (step === 6) {
      setValue("terms_accepted", false, { shouldValidate: true });
    }
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextStep = async () => {
    const fieldsToValidate = stepFieldMap[step];
    const ok = await trigger(fieldsToValidate as any, { shouldFocus: true });

    if (!ok) {
      // Get missing field labels
      const missingFields = fieldsToValidate
        .filter(field => errors[field])
        .map(field => FIELD_LABELS[field] || field);

      toast({
        title: "Incomplete Step",
        description: missingFields.length > 0
          ? `Please complete: ${missingFields.join(", ")}`
          : "Please check the required fields highlighted in red.",
        variant: "destructive",
      });
      return;
    }
    setStep((s) => Math.min(6, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadToBucket = async (file: File, key: string) => {
    const { error } = await supabase.storage.from("resumes").upload(key, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) throw error;
    return key;
  };

  const onSubmit: SubmitHandler<FormVals> = async (data) => {
    try {
      if ((remainingChances ?? 0) <= 0) {
        toast({ title: "Limit reached", variant: "destructive" });
        return;
      }
      if (!resumeFile) {
        toast({ title: "Resume required", variant: "destructive" });
        return;
      }
      setIsLoading(true);

      ensureAllowedDoc(resumeFile);
      const leadId = verified.applywizz_id;
      const slug = slugify(`${data.first_name} ${data.last_name}`);
      const resumeKey = `client_uploads/${leadId}/Resume_${slug}.${fileExt(resumeFile.name)}`;
      const coverKey = coverLetterFile
        ? `client_uploads/${leadId}/Cover_${slug}.${fileExt(coverLetterFile.name)}`
        : null;

      const resume_path = await uploadToBucket(resumeFile, resumeKey);
      let cover_letter_path = "";
      if (coverLetterFile) {
        await uploadToBucket(coverLetterFile, coverKey!);
        cover_letter_path = coverKey!;
      }

      const full_name = [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(" ");
      const visatypeValue = data.visatype === "Other" && data.visatype_other ? `Other - ${data.visatype_other}` : data.visatype || null;
      const workAuthDetails = `Over 18: ${data.is_over_18}, Eligible in US: ${data.eligible_to_work_in_us}, Authorized w/o Visa: ${data.authorized_without_visa}, Needs Sponsorship: ${data.require_future_sponsorship}`.trim();

      const payload = {
        first_name: data.first_name,
        middle_name: data.middle_name || null,
        last_name: data.last_name,
        full_name,
        personal_email: verified.email,
        company_email: data.company_email || null,
        primary_phone: data.primary_phone || null,
        callable_phone: data.callable_phone || null,
        whatsapp_number: data.whatsapp_number || null,
        full_address: data.full_address,
        zip_or_country: data.zip_or_country === "Other" ? `Other - ${data.other_country}` : data.zip_or_country,
        linkedin_url: data.linkedin_url || null,
        github_url: data.github_url || null,
        portfolio_url: data.portfolio_url || null,
        job_role_preferences: (data.job_role_preferences || []).map(role => role === "Other" && data.job_role_other ? data.job_role_other : role),
        job_role_other: data.job_role_other || null,
        location_preferences: data.location_preferences,
        salary_range: `${data.salary_currency} Yearly: ${data.salary_expectations_yearly}, Hourly: ${data.salary_expectations_hourly}`,
        needs_sponsorship: ynToBool(data.require_future_sponsorship),
        visatypes: visatypeValue,
        work_auth_details: workAuthDetails,
        main_subject: data.main_subject,
        graduation_year: data.graduation_year,
        addons: data.addons_notes || null,
        resume_path,
        cover_letter_path,
        submitted_by: null,
        lead_id: verified.applywizz_id,
        video_url: videoUrl,
        created_at: new Date().toISOString(),
        date_of_birth: data.date_of_birth ? parseDobToDate(data.date_of_birth) : null,
        willing_to_travel: ynToBool(data.willing_to_travel),
        notice_period: data.notice_period || null,
        education_percentage: data.cgpa ? parseFloat(data.cgpa) : null,
        employment_status: data.employment_status || null,
        recent_job_title: data.employment_history?.[0]?.job_title || null,
        recent_company_name: data.employment_history?.[0]?.company_name || null,
        employment_start_date: data.employment_history?.[0]?.start_date ? new Date(data.employment_history[0].start_date) : null,
        employment_end_date: data.employment_history?.[0]?.end_date ? new Date(data.employment_history[0].end_date) : null,
        working_status: data.employment_status === "Employed",
        is_over_18: ynToBool(data.is_over_18),
        eligible_to_work_in_us: ynToBool(data.eligible_to_work_in_us),
        authorized_without_visa: ynToBool(data.authorized_without_visa),
        require_future_sponsorship: ynToBool(data.require_future_sponsorship),
        can_perform_essential_functions: ynToBool(data.can_perform_essential_functions),
        worked_for_company_before: ynToBool(data.worked_for_company_before),
        discharged_for_policy_violation: ynToBool(data.discharged_for_policy_violation),
        referred_by_agency: ynToBool(data.referred_by_agency),
        highest_education: data.highest_education === "Other" ? "Other - See Education History" : data.highest_education,
        university_name: data.university_name,
        cumulative_gpa: data.cgpa,
        desired_start_date: data.desired_start_date ? parseDobToDate(data.desired_start_date) : null,
        willing_to_relocate: ynToBool(data.willing_to_relocate),
        can_work_3_days_in_office: ynToBool(data.can_work_3_days_in_office),
        role: (data.job_role_preferences || []).includes("Other") ? "Other" : data.role,
        experience: data.experience,
        work_preferences: data.work_preferences,
        alternate_job_roles: data.alternate_job_roles,
        exclude_companies: (data.exclude_companies && data.exclude_companies.length > 0)
          ? ((data.exclude_companies.length === 1 && data.exclude_companies[0] === "NA") ? null : data.exclude_companies.join(","))
          : null,
        convicted_of_felony: ynToBool(data.convicted_of_felony),
        felony_explanation: data.felony_explanation || null,
        pending_investigation: ynToBool(data.pending_investigation),
        willing_background_check: ynToBool(data.willing_background_check),
        willing_drug_screen: ynToBool(data.willing_drug_screen),
        failed_or_refused_drug_test: ynToBool(data.failed_or_refused_drug_test),
        uses_substances_affecting_duties: ynToBool(data.uses_substances_affecting_duties),
        substances_description: data.substances_description || null,
        can_provide_legal_docs: ynToBool(data.can_provide_legal_docs),
        gender: data.gender === "Other" ? `Other - ${data.gender_other}` : data.gender || null,
        is_hispanic_latino: data.is_hispanic_latino || null,
        race_ethnicity: data.race_ethnicity === "Other" ? `Other - ${data.race_ethnicity_other}` : data.race_ethnicity || null,
        veteran_status: data.veteran_status || null,
        disability_status: data.disability_status || null,

        current_country_timezone: data.current_country_timezone === "Other" ? `Other - ${data.current_country_timezone_other}` : data.current_country_timezone || null,
        province_territory: data.province_territory === "Other" ? `Other - ${data.province_territory_other}` : data.province_territory || null,
        county: data.county === "Other" ? `Other - ${data.county_other}` : data.county || null,
        religion: data.religion === "Other" ? `Other - ${data.religion_other}` : data.religion || null,
        sexual_orientation: data.sexual_orientation || null,
        pronouns: data.pronouns === "Other" ? `Other - ${data.pronouns_other}` : data.pronouns || null,
        salary_period: data.salary_period || null,
        has_alternates_available: data.has_alternates_available || false,
        employment_history: data.employment_history || [],
        form_filled_link: window.location.href,
        form_status: window.location.href.includes('apply-wizz.me') ? 'CORRECT' : 'DIFFERENT',
      };

      const { data: existingForm, error: existingErr } = await supabase
        .from("client_onborading_details")
        .select("id, no_of_times_form_filled, video_url")
        .eq("lead_id", verified.applywizz_id)
        .maybeSingle();

      if (existingErr) throw existingErr;

      if (existingForm) {
        const updatedPayload = {
          ...payload,
          // If local videoUrl is missing but DB has one, use the DB version
          video_url: videoUrl || existingForm.video_url,
          no_of_times_form_filled: (existingForm.no_of_times_form_filled || 0) + 1,
        };
        const { error: updateError } = await supabase.from("client_onborading_details").update(updatedPayload).eq("lead_id", verified.applywizz_id);
        if (updateError) throw updateError;
        toast({ title: "Data updated successfully!" });
      } else {
        const { error: insertError } = await supabase.from("client_onborading_details").insert(payload);
        if (insertError) throw insertError;
        toast({ title: "Onboarding completed successfully!" });
      }

      // Clear parsed data and other local storage keys on success
      localStorage.removeItem("resume_parsed_data");
      localStorage.removeItem("last_uploaded_resume_name");

      // Logout to clear the session credentials and states
      logout();

      navigate("/success", { replace: true });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrefill = () => {
    const dummyData: any = {
      first_name: "Alexander",
      middle_name: "James",
      last_name: "Richardson",
      personal_email: verified.email,
      company_email: "marketing-email@example.com",
      primary_phone: "+12025550123",
      callable_phone: "+12025550456",
      whatsapp_number: "+12025550678",
      full_address: "725 5th Ave, New York, NY 10022, USA",
      zip_or_country: "United States",
      visatype: "Citizen",
      date_of_birth: "06/15/94",
      linkedin_url: "https://linkedin.com/in/alexrichardson",
      is_over_18: "yes",
      eligible_to_work_in_us: "yes",
      authorized_without_visa: "yes",
      require_future_sponsorship: "no",
      can_perform_essential_functions: "yes",
      worked_for_company_before: "no",
      discharged_for_policy_violation: "no",
      referred_by_agency: "no",
      highest_education: "Master’s Degree",
      university_name: "Stanford University",
      main_subject: "Software Engineering",
      graduation_year: "2016",
      cumulative_gpa: "3.9",
      desired_start_date: "06/01/24",
      willing_to_relocate: "yes",
      can_work_3_days_in_office: "yes",
      salary_expectations: "120k-160k",
      experience: "7",
      work_preferences: ["Hybrid", "Remote"],
      job_role_preferences: ["Software Engineer"],
      location_preferences: ["New York", "San Francisco"],
      willing_to_travel: "yes",
      notice_period: "30 Days",
      employment_status: "Employed",
      recent_job_title: "Senior Developer",
      recent_company_name: "Google",
      employment_start_date: "2018-05-15",
      convicted_of_felony: "no",
      pending_investigation: "no",
      willing_background_check: "yes",
      willing_drug_screen: "yes",
      failed_or_refused_drug_test: "no",
      uses_substances_affecting_duties: "no",
      can_provide_legal_docs: "yes",
      gender: "Male",
      pronouns: "He/Him",
      gender_identity: "Cisgender",
      sexual_orientation: "Heterosexual",
      religion: "Not disclosed",
      is_hispanic_latino: "No",
      race_ethnicity: "White",
      veteran_status: "I am not a protected veteran",
      disability_status: "No, I do not have a disability",
      financial_licenses: "no",
      current_country_timezone: "USA (EST)",
      has_relatives_in_company: "no",
      working_status: true,
    };

    Object.entries(dummyData).forEach(([key, value]) => {
      setValue(key as any, value, { shouldValidate: true });
    });
    setResumeFile(new File(["dummy content"], "resume.pdf", { type: "application/pdf" }));
    toast({ title: "Form prefilled with dummy data!" });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
          {/* Chances Dialog */}
          <Dialog open={showChancesDialog} onOpenChange={setShowChancesDialog}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Submission Status
                </DialogTitle>
                <DialogDescription className="py-2">
                  {remainingChances === null
                    ? "Checking your submission records..."
                    : `You have ${remainingChances} of 2 submission attempts remaining.`}
                  {remainingChances === 0 && (
                    <span className="block mt-3 text-destructive font-semibold">
                      You have reached the submission limit. Further updates are blocked.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end mt-4">

                <Button onClick={() => setShowChancesDialog(false)}>Got it</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Header Section */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 bg-blue-600 h-full" />
            <div className="flex-1 text-center md:text-left w-full">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Onboarding Process</h1>
              <p className="text-slate-500 text-sm">Step {step} of 6 — {
                step === 1 ? "Personal Details" :
                  step === 2 ? "Eligibility Check" :
                    step === 3 ? "Experience & Education" :
                      step === 4 ? "Background Check" :
                        step === 5 ? "Demographics" : "Review & Submit"
              }</p>
              <div className="mt-4 w-full md:w-64 h-2 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${(step / 6) * 100}%` }}
                />
              </div>

              {/* User Credentials Section */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[10px] sm:text-xs">
                <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center justify-between sm:justify-start gap-2">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">ID:</span>
                  <span className="text-slate-900 font-mono truncate">{verified.applywizz_id}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center justify-between sm:justify-start gap-2">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">Email:</span>
                  <span className="text-slate-900 truncate">{verified.email}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center justify-between sm:justify-start gap-2">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">Phone:</span>
                  <span className="text-slate-900 truncate">{verified.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-6 md:p-10 flex-1">
              {step === 1 && (
                <Step1Personal
                  register={register}
                  control={control}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  addressOpen={addressOpen}
                  setAddressOpen={setAddressOpen}
                  addressValue={addressValue}
                  setAddressValue={setAddressValue}
                  setResumeFile={setResumeFile}
                  setCoverLetterFile={setCoverLetterFile}
                  resumeFile={resumeFile}
                  coverLetterFile={coverLetterFile}
                  isParsing={isParsing}
                />
              )}
              {step === 2 && <Step2Eligibility watch={watch} setValue={setValue} register={register} errors={errors} />}
              {step === 3 && (
                <Step3Education
                  register={register} errors={errors} watch={watch} setValue={setValue}
                  control={control}
                  jobRolesLoading={jobRolesLoading} jobRolesData={jobRolesData}
                  alternateRolesOptions={alternateRolesOptions} toast={toast}
                />
              )}
              {step === 4 && <Step4Background register={register} errors={errors} watch={watch} setValue={setValue} />}
              {step === 5 && <Step5Demographics register={register} errors={errors} watch={watch} setValue={setValue} />}
              {step === 6 && (
                <Step6Review
                  watch={watch} setStep={setStep}
                  resumeFile={resumeFile} coverLetterFile={coverLetterFile}
                  setValue={setValue}
                />
              )}
            </div>

            {/* Navigation Bar */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
              <Button type="button" variant="ghost" onClick={prevStep} className="text-slate-600 hover:bg-slate-200">
                Back
              </Button>

              {step < 6 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-md transition-all h-11 sm:h-10"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsSubmitDialogOpen(true)}
                  disabled={isLoading || (remainingChances ?? 0) <= 0 || !watch("terms_accepted")}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-10 shadow-lg shadow-green-200 transition-all h-11 sm:h-10"
                >
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </form>

          {/* Final Submission Confirmation Dialog */}
          <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Confirm Submission</DialogTitle>
                <div className="py-4 space-y-3">
                  <p className="text-slate-600 text-sm">Are you sure you want to submit your application? Please ensure all details are correct as you won't be able to edit them after submission.</p>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 text-amber-800 text-[10px] sm:text-xs italic">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Your profile will be processed using the ID: <b>{verified.applywizz_id}</b></span>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex gap-3 justify-end mt-4">
                <Button variant="ghost" onClick={() => setIsSubmitDialogOpen(false)} disabled={isLoading}>
                  Review Again
                </Button>
                <Button
                  onClick={() => {
                    setIsSubmitDialogOpen(false);
                    handleSubmit(onSubmit)();
                  }}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                >
                  {isLoading ? "Submitting..." : "Yes, Submit Application"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
