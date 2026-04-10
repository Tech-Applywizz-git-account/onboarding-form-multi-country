import { z } from "zod";

export const yesNo = z.enum(["yes", "no"]);

export const schema = z.object({
  // Step 1
  first_name: z.string().min(1, "Required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Required"),
  personal_email: z.string().email("Invalid email"),
  primary_phone: z.string().regex(/^\+[0-9]+$/, "Format: +[numbers] (no spaces or dashes)"),
  callable_phone: z.string().regex(/^\+[0-9]+$/, "Format: +[numbers] (no spaces or dashes)"),
  whatsapp_number: z.string().regex(/^\+[0-9]+$/, "Format: +[numbers] (no spaces or dashes)"),
  full_address: z.string().min(1, "Required"),
  zip_or_country: z.string().min(1, "Required"),
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
  worked_for_company_before: yesNo,
  discharged_for_policy_violation: yesNo,
  referred_by_agency: yesNo,

  // Step 3
  highest_education: z.string().min(1, "Required"),
  university_name: z.string().min(1, "Required"),
  cumulative_gpa: z.string().min(1, "Required"),
  desired_start_date: z.string().min(1, "Required"),
  willing_to_relocate: yesNo,
  can_work_3_days_in_office: yesNo,
  salary_expectations: z.string().min(1, "Required"),
  role: z.string().min(1, "Required"),
  experience: z.string().min(1, "Required"),
  work_preferences: z.string().min(1, "Required"),
  alternate_job_roles: z.string().optional(),
  exclude_companies: z.string().optional(),
  job_role_preferences: z.array(z.string()).min(1, "Required"),
  job_role_other: z.string().optional(),
  location_preferences: z.array(z.string()).min(1),
  main_subject: z.string().min(1, "Required"),
  graduation_year: z.string().min(4, "Required"),

  // New fields for employment and availability
  willing_to_travel: yesNo,
  notice_period: z.string().min(1, "Required"),
  education_percentage: z.string().min(1, "Required"),
  employment_status: z.enum(["Employed", "Unemployed"]),
  recent_job_title: z.string().optional(),
  recent_company_name: z.string().optional(),
  employment_start_date: z.string().optional(),
  employment_end_date: z.string().optional(),
  working_status: z.boolean().optional().default(false),
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
  is_hispanic_latino: z.string().min(1, "Required"),
  race_ethnicity: z.string().min(1, "Required"),
  veteran_status: z.string().min(1, "Required"),
  disability_status: z.string().min(1, "Required"),
  has_relatives_in_company: yesNo,
  relatives_details: z.string().optional(),

  // Form filled link
  form_filled_link: z.string().optional(),

  // Form status
  form_status: z.string().optional(),
}).superRefine((data, ctx) => {
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

  // Conditional Validation for Relatives in Company
  if (data.has_relatives_in_company === "yes") {
    if (!data.relatives_details || data.relatives_details.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide details of your relatives",
        path: ["relatives_details"],
      });
    }
  }
});

export type FormVals = z.infer<typeof schema>;
