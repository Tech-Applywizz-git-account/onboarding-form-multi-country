import { z } from "zod";

export const yesNo = z.enum(["yes", "no"]);

export const schema = z.object({
  // Step 1
  first_name: z.string().min(1, "Required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Required"),
  personal_email: z.string().email("Invalid email"),
  primary_phone: z.string().regex(/^\+[0-9]+$/, "Please enter a valid phone number"),
  callable_phone: z.string().optional(),
  whatsapp_number: z.string().regex(/^\+[0-9]+$/, "Please enter a valid phone number"),
  full_address: z.string().min(1, "Required"),
  zip_or_country: z.string().min(1, "Required"),
  other_country: z.string().optional(),
  visatype: z.string().min(1, "Required"),
  visatype_other: z.string().optional(),
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  addons_notes: z.string().optional(),
  resume_dummy: z.string().min(1, "Resume required"),
  date_of_birth: z.string().min(1, "Required"),

  // Step 2
  is_over_18: yesNo,
  eligible_to_work_in_us: yesNo,
  authorized_without_visa: yesNo,
  require_future_sponsorship: yesNo,
  can_perform_essential_functions: yesNo,
  worked_for_company_before: yesNo.optional(),
  discharged_for_policy_violation: yesNo,
  referred_by_agency: yesNo,

  // Step 3
  highest_education: z.string().min(1, "Required"),
  university_name: z.string().min(1, "Required"),
  main_subject: z.string().min(1, "Required"),
  graduation_year: z.string().min(4, "Required"),
  cgpa: z.string().min(1, "Required"),
  desired_start_date: z.string().min(1, "Required"),
  willing_to_relocate: yesNo,
  can_work_3_days_in_office: yesNo,
  salary_expectations: z.string().min(1, "Required"),
  salary_currency: z.string().min(1, "Required"),
  salary_period: z.enum(["Yearly", "Monthly", "Hourly"]),
  role: z.string().min(1, "Required"),
  experience: z.string().min(1, "Required"),
  work_preferences: z.array(z.string(), { invalid_type_error: "Please select at least one work preference" }).min(1, "Please select at least one work preference"),
  alternate_job_roles: z.string().optional(),
  exclude_companies: z.array(z.string()).optional().default(["NA"]),
  job_role_preferences: z.array(z.string(), { invalid_type_error: "Please select at least one job role" }).min(1, "Please select at least one job role"),
  job_role_other: z.string().optional(),
  location_preferences: z.array(z.string()).optional().default([]),
  willing_to_travel: yesNo,
  notice_period: z.string().min(1, "Required"),
  employment_status: z.enum(["Employed", "Unemployed"]),
  employment_history: z.array(z.object({
    job_title: z.string().optional(),
    company_name: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_current: z.boolean().default(false),
  })).optional(),
  has_alternates_available: z.boolean().optional().default(false),

  // Step 4
  convicted_of_felony: yesNo,
  felony_explanation: z.string().optional(),
  pending_investigation: yesNo,
  willing_background_check: yesNo,
  willing_drug_screen: yesNo,
  failed_or_refused_drug_test: yesNo,
  uses_substances_affecting_duties: yesNo,
  substances_description: z.string().optional(),
  can_provide_legal_docs: yesNo,

  // Step 5
  gender: z.string().min(1, "Gender is required"),
  pronouns: z.string().optional(),
  sexual_orientation: z.string().optional(),
  religion: z.string().optional(),
  is_hispanic_latino: z.string().optional(),
  race_ethnicity: z.string().optional(),
  race_ethnicity_other: z.string().optional(),
  veteran_status: z.string().optional(),
  disability_status: z.string().min(1, "Required"),
  financial_licenses: yesNo,
  current_country_timezone: z.string().min(1, "Required"),
  current_country_timezone_other: z.string().optional(),
  province_territory: z.string().optional(),
  province_territory_other: z.string().optional(),
  county: z.string().optional(),
  county_other: z.string().optional(),
  religion_other: z.string().optional(),
  pronouns_other: z.string().optional(),
  gender_other: z.string().optional(),

  // Form filled link
  form_filled_link: z.string().optional(),

  // Form status
  form_status: z.string().optional(),
}).superRefine((data, ctx) => {
  // Conditional Validation for Other Country
  if (data.zip_or_country === "Other") {
    if (!data.other_country || data.other_country.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your country",
        path: ["other_country"],
      });
    }
  }

  // Conditional Validation for Employment History
  if (data.work_preferences?.includes("Remote")) {
    if (!data.location_preferences || data.location_preferences.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select at least one location",
        path: ["location_preferences"],
      });
    }
  }

  // Conditional Validation for Employment History
  if (data.experience && data.experience !== "0") {
    if (!data.employment_history || data.employment_history.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please add at least one employment record based on your experience",
        path: ["experience"],
      });
    } else {
      data.employment_history.forEach((job, index) => {
        if (!job.job_title || job.job_title.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Required",
            path: ["employment_history", index, "job_title"],
          });
        }
        if (!job.company_name || job.company_name.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Required",
            path: ["employment_history", index, "company_name"],
          });
        }
        if (!job.start_date || job.start_date.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Required",
            path: ["employment_history", index, "start_date"],
          });
        }
        if (!job.is_current && (!job.end_date || job.end_date.trim() === "")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Required",
            path: ["employment_history", index, "end_date"],
          });
        }
      });
    }
  }

  // Conditional Validation for Visa Type Other
  if (data.visatype === "Other") {
    if (!data.visatype_other || data.visatype_other.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required",
        path: ["visatype_other"],
      });
    }
  }

  // Conditional Validation for 'Other' Preferred Job Role
  if (data.job_role_preferences?.includes("Other")) {
    if (!data.job_role_other || data.job_role_other.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required",
        path: ["job_role_other"],
      });
    }
  }

  // Conditional Validation for Alternate Job Roles
  if (data.has_alternates_available) {
    if (!data.alternate_job_roles || data.alternate_job_roles.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select at least one alternate role",
        path: ["alternate_job_roles"],
      });
    }
  }

  // Conditional Validation for Felony Explanation
  if (data.convicted_of_felony === "yes") {
    if (!data.felony_explanation || data.felony_explanation.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide details regarding the conviction",
        path: ["felony_explanation"],
      });
    }
  }

  // Conditional Validation for Substances Description
  if (data.uses_substances_affecting_duties === "yes") {
    if (!data.substances_description || data.substances_description.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide a description of the substances used",
        path: ["substances_description"],
      });
    }
  }

  // Conditional Validation for Province/Territory (Canada or USA)
  if (data.zip_or_country === "Canada" || data.zip_or_country === "United States") {
    if (!data.province_territory || data.province_territory.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required",
        path: ["province_territory"],
      });
    }
  }

  // Conditional Validation for County (UK)
  if (data.zip_or_country === "United Kingdom") {
    if (!data.county || data.county.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required",
        path: ["county"],
      });
    }
  }

  // Conditional Validation for 'Other' fields in Step 5
  if (data.religion === "Other" && (!data.religion_other || data.religion_other.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["religion_other"] });
  }
  if (data.province_territory === "Other" && (!data.province_territory_other || data.province_territory_other.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["province_territory_other"] });
  }
  if (data.county === "Other" && (!data.county_other || data.county_other.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["county_other"] });
  }
  if (data.pronouns === "Other" && (!data.pronouns_other || data.pronouns_other.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["pronouns_other"] });
  }
  if (data.gender === "Other" && (!data.gender_other || data.gender_other.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["gender_other"] });
  }
  if (data.current_country_timezone === "Other" && (!data.current_country_timezone_other || data.current_country_timezone_other.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["current_country_timezone_other"] });
  }
  if (data.race_ethnicity === "Other" && (!data.race_ethnicity_other || data.race_ethnicity_other.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["race_ethnicity_other"] });
  }

  // Step 5 Mandatory when Visible
  if (!data.pronouns || data.pronouns.trim() === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["pronouns"] });
  }
  if (!data.sexual_orientation || data.sexual_orientation.trim() === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["sexual_orientation"] });
  }
  if (!data.religion || data.religion.trim() === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["religion"] });
  }

  const isCanada = data.zip_or_country === "Canada";
  const isUK = data.zip_or_country === "United Kingdom";
  const isIreland = data.zip_or_country === "Ireland";
  const isUS = data.zip_or_country === "United States" || data.zip_or_country === "USA";
  
  const showEEO = isUS || (!isCanada && !isUK && !isIreland);

  if (showEEO) {
    if (!data.is_hispanic_latino || data.is_hispanic_latino.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["is_hispanic_latino"] });
    }
    if (isUS && (!data.race_ethnicity || data.race_ethnicity.trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["race_ethnicity"] });
    }
    if (isUS && (!data.veteran_status || data.veteran_status.trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["veteran_status"] });
    }
  }
});

export type FormVals = z.infer<typeof schema>;
