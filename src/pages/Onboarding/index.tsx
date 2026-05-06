import React, { useState, useEffect, useRef } from "react";
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
import { AlertTriangle } from "lucide-react";

// Schema & Constants
import { schema, FormVals } from "./schema";
import { slugify, fileExt, ensureAllowedDoc, ynToBool } from "./helpers";
import { jobRoleOptions } from "./constants";

// Step Components
import { Step1Personal } from "./components/Step1Personal";
import { Step2Eligibility } from "./components/Step2Eligibility";
import { Step3Education } from "./components/Step3Education";
import { Step4Background } from "./components/Step4Background";
import { Step5Demographics } from "./components/Step5Demographics";
import { Step6Review } from "./components/Step6Review";
import { ParsedResumeData } from "./resumeParser";

const FIELD_LABELS: Record<string, string> = {
  first_name: "First Name",
  last_name: "Last Name",
  personal_email: "Email Address",
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
  salary_expectations: "Salary Expectations",
  role: "Job Role",
  experience: "Experience Level",
  work_preferences: "Work Preferences",
  job_role_preferences: "Job Role Preference",
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
  pronouns: "Pronoun",
  religion: "Religion",
  is_hispanic_latino: "Hispanic/Latino Status",
  race_ethnicity: "Race/Ethnicity",
  veteran_status: "Veteran Status",
  disability_status: "Disability Status",
  financial_licenses: "Financial Services Industry Licenses",
  current_country_timezone: "Current Country & Timezone",
  province_territory: "Province / Territory",
  county: "County",
};

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifiedUser, resumeFile, setResumeFile } = useAuth();
  const verified = verifiedUser;

  // Safety redirect if someone bypasses ProtectedRoute (shouldn't happen)
  useEffect(() => {
    if (!verified) {
      navigate("/", { replace: true });
    }
  }, [verified, navigate]);

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
      primary_phone: "+",
      callable_phone: "+",
      whatsapp_number: "+",
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
      salary_expectations: "",
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
      financial_licenses: "no",
      current_country_timezone: "",
      province_territory: "",
      county: "",

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
      if (!verified.email) return;
      const { count, error } = await supabase
        .from("client_onborading_details")
        .select("id", { count: "exact", head: true })
        .eq("personal_email", verified.email);
      if (!error) {
        const remaining = Math.max(0, 2 - (count ?? 0));
        setRemainingChances(remaining);
        setShowChancesDialog(true);
      }
    })();
  }, [verified.email]);

  // Sync Resume Dummy Field for Validation
  useEffect(() => {
    setValue("resume_dummy", resumeFile ? "yes" : "");
    if (resumeFile) {
      localStorage.setItem("last_uploaded_resume_name", resumeFile.name);
    }
  }, [resumeFile, setValue]);

  const primaryPhone = watch("primary_phone");
  
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

  // Check for Parsed Resume Data in localStorage on mount
  useEffect(() => {
    const rawData = localStorage.getItem("resume_parsed_data");
    if (rawData) {
      try {
        const parsedData: ParsedResumeData = JSON.parse(rawData);
        
        // Map fields to form
        const fieldsToFill: (keyof FormVals)[] = [
          "first_name", "middle_name", "last_name", "personal_email", 
          "primary_phone", "full_address", "linkedin_url", "github_url", 
          "portfolio_url", "date_of_birth", "highest_education", 
          "university_name", "main_subject", "graduation_year", "cgpa",
          "experience", "employment_status", "employment_history",
          "job_role_preferences", "gender"
        ];

        fieldsToFill.forEach(field => {
          let val = (parsedData as any)[field];

          // 1. Normalize Highest Education (straight vs curly apostrophe)
          if (field === "highest_education" && typeof val === "string") {
            // Match the specific curly apostrophes used in Select options
            val = val.replace(/'/g, "’");
          }

          // 2. Normalize Employment History Dates (YYYY-MM -> YYYY-MM-DD)
          if (field === "employment_history" && Array.isArray(val)) {
            const normalizedHistory = val.map(job => ({
              ...job,
              start_date: (job.start_date && job.start_date.length === 7) ? `${job.start_date}-01` : job.start_date,
              end_date: (job.end_date && job.end_date.length === 7) ? `${job.end_date}-01` : job.end_date,
            }));
            replaceEmployment(normalizedHistory);
            return;
          }

          // 3. Normalize Date of Birth (YYYY-MM-DD -> Regional Format)
          if (field === "date_of_birth" && typeof val === "string" && val.includes("-") && val.length === 10) {
            const dateParts = val.split("-");
            if (dateParts[0].length === 4) { // YYYY-MM-DD format from AI
              const [y, m, d] = dateParts;
              const currentCountry = watch("zip_or_country");
              const isUS = currentCountry === "United States" || currentCountry === "USA";
              val = isUS ? `${m}-${d}-${y}` : `${d}-${m}-${y}`;
            }
          }

          if (val !== undefined && val !== null && val !== "") {
            if (Array.isArray(val) && val.length === 0) return;
            setValue(field as any, val, { shouldValidate: true });
          }
        });

        toast({
          title: "Profile Auto-filled",
          description: "We've applied the data from your resume. Please review each step.",
        });
      } catch (e) {
        console.error("Failed to parse localStorage resume data", e);
      }
    }
  }, [setValue, toast]);

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
    1: ["first_name", "last_name", "personal_email", "primary_phone", "whatsapp_number", "full_address", "visatype", "visatype_other", "date_of_birth", "zip_or_country", "resume_dummy"],
    2: ["is_over_18", "eligible_to_work_in_us", "authorized_without_visa", "require_future_sponsorship", "can_perform_essential_functions", "discharged_for_policy_violation", "referred_by_agency"],
    3: ["highest_education", "university_name", "main_subject", "graduation_year", "cgpa", "desired_start_date", "willing_to_relocate", "can_work_3_days_in_office", "salary_expectations", "salary_period", "role", "experience", "work_preferences", "job_role_preferences", "location_preferences", "willing_to_travel", "notice_period", "employment_status", "employment_history", "alternate_job_roles", "has_alternates_available"],
    4: ["convicted_of_felony", "felony_explanation", "pending_investigation", "willing_background_check", "willing_drug_screen", "failed_or_refused_drug_test", "uses_substances_affecting_duties", "substances_description", "can_provide_legal_docs"],
    5: ["gender", "pronouns", "religion", "is_hispanic_latino", "race_ethnicity", "veteran_status", "disability_status", "financial_licenses", "current_country_timezone", "province_territory", "county"],
    6: [],
  };

  const prevStep = () => {
    if (step === 1) {
      navigate("/resume-upload");
      return;
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
        primary_phone: data.primary_phone || null,
        callable_phone: data.callable_phone || null,
        whatsapp_number: data.whatsapp_number || null,
        full_address: data.full_address,
        zip_or_country: data.zip_or_country === "Other" ? `Other - ${data.other_country}` : data.zip_or_country,
        linkedin_url: data.linkedin_url || null,
        github_url: data.github_url || null,
        portfolio_url: data.portfolio_url || null,
        job_role_preferences: (data.job_role_preferences || []).map(role => role === "Other" && data.job_role_other ? `Other - ${data.job_role_other}` : role),
        job_role_other: data.job_role_other || null,
        location_preferences: data.location_preferences,
        salary_range: data.salary_expectations,
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
        created_at: new Date().toISOString(),
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
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
        desired_start_date: data.desired_start_date ? new Date(data.desired_start_date) : null,
        willing_to_relocate: ynToBool(data.willing_to_relocate),
        can_work_3_days_in_office: ynToBool(data.can_work_3_days_in_office),
        role: data.role,
        experience: data.experience,
        work_preferences: data.work_preferences,
        alternate_job_roles: data.alternate_job_roles,
        exclude_companies: data.exclude_companies,
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
        financial_licenses: ynToBool(data.financial_licenses),
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
        .select("id, no_of_times_form_filled")
        .eq("lead_id", verified.applywizz_id)
        .maybeSingle();

      if (existingErr) throw existingErr;

      if (existingForm) {
        const updatedPayload = {
          ...payload,
          no_of_times_form_filled: existingForm.no_of_times_form_filled + 1,
        };
        const { error: updateError } = await supabase.from("client_onborading_details").update(updatedPayload).eq("lead_id", verified.applywizz_id);
        if (updateError) throw updateError;
        toast({ title: "Data updated successfully!" });
      } else {
        const { error: insertError } = await supabase.from("client_onborading_details").insert(payload);
        if (insertError) throw insertError;
        toast({ title: "Onboarding completed successfully!" });
      }

      // Clear parsed data on success
      localStorage.removeItem("resume_parsed_data");

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
      primary_phone: "+12025550123",
      callable_phone: "+12025550456",
      whatsapp_number: "+12025550678",
      full_address: "725 5th Ave, New York, NY 10022, USA",
      zip_or_country: "United States",
      visatype: "Citizen",
      date_of_birth: "1994-06-15",
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
      desired_start_date: "2024-06-01",
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
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
                  <p className="mt-3 text-destructive font-semibold">
                    You have reached the submission limit. Further updates are blocked.
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowChancesDialog(false)}>Got it</Button>
          </DialogContent>
        </Dialog>

        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 bg-blue-600 h-full" />
          <div className="flex-1 text-center md:text-left">
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
          <Button
            variant="outline"
            onClick={handlePrefill}
            className="w-full md:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm transition-all text-xs"
          >
            Prefill for Testing
          </Button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 md:p-10 flex-1">
            {step === 1 && (
              <Step1Personal
                register={register}
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
                disabled={isLoading || (remainingChances ?? 0) <= 0}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-10 shadow-lg shadow-green-200 transition-all h-11 sm:h-10"
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
  );
};

export default OnboardingPage;
