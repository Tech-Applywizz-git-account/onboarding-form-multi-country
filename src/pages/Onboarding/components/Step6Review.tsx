import React from "react";
import { UseFormWatch } from "react-hook-form";
import { FormVals } from "../schema";
import { Button } from "@/components/ui/button";

interface Step6Props {
  watch: UseFormWatch<FormVals>;
  setStep: (step: number) => void;
  resumeFile: File | null;
  coverLetterFile: File | null;
}

const ReviewSection: React.FC<{
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}> = ({ title, step, onEdit, children }) => (
  <div className="border rounded-xl p-5 bg-slate-50/50 shadow-sm transition-all hover:shadow-md hover:bg-slate-50">
    <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">{title}</h4>
      <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        onClick={() => onEdit(step)}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-3 text-xs font-semibold"
      >
        Edit
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
      {children}
    </div>
  </div>
);

const ReviewItem: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
  <div className={`${fullWidth ? "col-span-full" : ""} flex flex-col space-y-1`}>
    <span className="text-slate-500 font-medium text-[11px] uppercase">{label}</span>
    <span className="text-slate-900 font-semibold">{value || <span className="text-slate-300 italic">Not provided</span>}</span>
  </div>
);

export const Step6Review: React.FC<Step6Props> = ({
  watch,
  setStep,
  resumeFile,
  coverLetterFile,
}) => {
  const data = watch();

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-700 rounded-2xl p-8 text-white shadow-xl shadow-blue-200/50 animate-in fade-in slide-in-from-top-4 duration-500">
        <h3 className="font-bold text-2xl mb-2">Review Your Application</h3>
        <p className="text-blue-50 text-sm opacity-90 leading-relaxed">
          Please review your information carefully before submitting. Accuracy ensures faster processing of your application. You can click <strong>"Edit"</strong> on any section to make changes.
        </p>
      </div>

      <ReviewSection title="Step 1: Personal Information" step={1} onEdit={setStep}>
        <ReviewItem label="First Name" value={data.first_name} />
        <ReviewItem label="Middle Name" value={data.middle_name} />
        <ReviewItem label="Last Name" value={data.last_name} />
        <ReviewItem label="Personal Email" value={data.personal_email} />
        <ReviewItem label="Primary Phone" value={data.primary_phone} />
        <ReviewItem label="WhatsApp Number" value={data.whatsapp_number} />
        <ReviewItem label="Date of Birth" value={data.date_of_birth} />
        <ReviewItem label="Country" value={data.zip_or_country} />
        <ReviewItem label="Full Address" value={data.full_address} fullWidth />
        <ReviewItem label="Current Visa Type" value={data.visatype === "Other" ? data.visatype_other : data.visatype} />
        <ReviewItem label="LinkedIn URL" value={data.linkedin_url} />
        <ReviewItem label="GitHub URL" value={data.github_url} />
        <ReviewItem label="Portfolio URL" value={data.portfolio_url} />
        <div className="col-span-full grid grid-cols-2 gap-4 mt-2">
          <ReviewItem label="Resume Attachment" value={resumeFile?.name} />
          <ReviewItem label="Cover Letter Attachment" value={coverLetterFile?.name} />
        </div>
      </ReviewSection>

      <ReviewSection title="Step 2: Eligibility & Authorization" step={2} onEdit={setStep}>
        <ReviewItem label="Are you 18+ years of age?" value={data.is_over_18 === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Eligible to work in US?" value={data.eligible_to_work_in_us === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Authorized without Visa?" value={data.authorized_without_visa === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Require future sponsorship?" value={data.require_future_sponsorship === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Can perform essential functions?" value={data.can_perform_essential_functions === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Worked for company before?" value={data.worked_for_company_before === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Discharged for policy violation?" value={data.discharged_for_policy_violation === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Referred by agency?" value={data.referred_by_agency === "yes" ? "Yes" : "No"} />
      </ReviewSection>

      <ReviewSection title="Step 3: Education & Experience" step={3} onEdit={setStep}>
        <ReviewItem label="Highest Education" value={data.highest_education} />
        <ReviewItem label="University Name" value={data.university_name} />
        <ReviewItem label="Main Subject" value={data.main_subject} />
        <ReviewItem label="Graduation Year" value={data.graduation_year} />
        <ReviewItem label="Cumulative GPA" value={data.cgpa} />
        <ReviewItem label="Total Experience" value={`${data.experience} Year(s)`} />
        <ReviewItem label="Employment Status" value={data.employment_status} />
        <ReviewItem label="Notice Period" value={data.notice_period} />
        <ReviewItem label="Desired Start Date" value={data.desired_start_date} />
        <ReviewItem label="Salary Expectations" value={data.salary_expectations} fullWidth />
        <ReviewItem label="Work Preferences" value={data.work_preferences?.join(", ")} fullWidth />
        <ReviewItem label="Job Role Preferences" value={data.job_role_preferences?.join(", ")} fullWidth />
        <ReviewItem label="Location Preferences" value={data.location_preferences?.join(", ")} fullWidth />
        <ReviewItem label="Alternate Job Roles" value={data.alternate_job_roles} fullWidth />
        <ReviewItem label="Excluded Companies" value={data.exclude_companies?.join(", ")} fullWidth />
        <ReviewItem label="Willing to Relocate?" value={data.willing_to_relocate === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Can work 3 days in office?" value={data.can_work_3_days_in_office === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Willing to travel for business?" value={data.willing_to_travel === "yes" ? "Yes" : "No"} />

        {data.employment_status === "Employed" && data.employment_history && data.employment_history.length > 0 && (
          <div className="col-span-full mt-4 space-y-4">
            <h5 className="font-bold text-slate-700 text-xs uppercase border-l-4 border-blue-500 pl-3">Employment History</h5>
            <div className="space-y-3">
              {data.employment_history.map((job, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReviewItem label="Job Title" value={job.job_title} />
                  <ReviewItem label="Company Name" value={job.company_name} />
                  <ReviewItem label="Start Date" value={job.start_date} />
                  <ReviewItem label="Current Job?" value={job.is_current ? "Yes" : "No"} />
                  {!job.is_current && <ReviewItem label="End Date" value={job.end_date} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Step 4: Background & Screening" step={4} onEdit={setStep}>
        <ReviewItem label="Convicted of Felony?" value={data.convicted_of_felony === "yes" ? "Yes" : "No"} />
        {data.convicted_of_felony === "yes" && <ReviewItem label="Felony Explanation" value={data.felony_explanation} fullWidth />}
        <ReviewItem label="Pending Investigation?" value={data.pending_investigation === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Willing for Background Check?" value={data.willing_background_check === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Willing for Drug Screen?" value={data.willing_drug_screen === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Failed/Refused Drug Test?" value={data.failed_or_refused_drug_test === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Uses Substances Affecting Duties?" value={data.uses_substances_affecting_duties === "yes" ? "Yes" : "No"} />
        {data.uses_substances_affecting_duties === "yes" && <ReviewItem label="Substances Description" value={data.substances_description} fullWidth />}
        <ReviewItem label="Can provide legal docs?" value={data.can_provide_legal_docs === "yes" ? "Yes" : "No"} />
      </ReviewSection>

      <ReviewSection title="Step 5: Demographics & Identity" step={5} onEdit={setStep}>
        <div className="col-span-full mb-2">
          <h5 className="font-bold text-slate-700 text-[10px] uppercase tracking-tighter opacity-70">Identity & Preferences</h5>
        </div>
        <ReviewItem label="Gender" value={data.gender === "Other" ? `Other - ${data.gender_other}` : data.gender} />
        <ReviewItem label="Pronouns" value={data.pronouns === "Other" ? `Other - ${data.pronouns_other}` : data.pronouns} />
        <ReviewItem label="Sexual Orientation" value={data.sexual_orientation} />
        
        <div className="col-span-full mt-4 mb-2">
          <h5 className="font-bold text-slate-700 text-[10px] uppercase tracking-tighter opacity-70">Location & Professional</h5>
        </div>
        <ReviewItem 
          label="Based Country & Timezone" 
          value={data.current_country_timezone === "Other" ? `Other - ${data.current_country_timezone_other}` : data.current_country_timezone} 
          fullWidth 
        />
        {data.zip_or_country === "Canada" && (
          <ReviewItem label="Province / Territory" value={data.province_territory === "Other" ? `Other - ${data.province_territory_other}` : data.province_territory} />
        )}
        {data.zip_or_country === "United States" && (
          <ReviewItem label="State" value={data.province_territory === "Other" ? `Other - ${data.province_territory_other}` : data.province_territory} />
        )}
        <ReviewItem label="County" value={data.county === "Other" ? `Other - ${data.county_other}` : data.county} />
        <ReviewItem label="Religion" value={data.religion === "Other" ? `Other - ${data.religion_other}` : data.religion} />
        <ReviewItem label="Financial Industry Licenses?" value={data.financial_licenses === "yes" ? "Yes" : "No"} />

        {(data.zip_or_country === "United States" || (!["Canada", "United Kingdom", "Ireland"].includes(data.zip_or_country || ""))) && (
          <>
            <div className="col-span-full mt-4 mb-2">
              <h5 className="font-bold text-slate-700 text-[10px] uppercase tracking-tighter opacity-70">EEO (United States)</h5>
            </div>
            <ReviewItem label="Hispanic/Latino" value={data.is_hispanic_latino} />
            <ReviewItem label="Race/Ethnicity" value={data.race_ethnicity === "Other" ? `Other - ${data.race_ethnicity_other}` : data.race_ethnicity} />
            <ReviewItem label="Veteran Status" value={data.veteran_status} />
          </>
        )}

        <div className="col-span-full mt-4 mb-2">
          <h5 className="font-bold text-slate-700 text-[10px] uppercase tracking-tighter opacity-70">Additional Information</h5>
        </div>
        <ReviewItem label="Disability Status" value={data.disability_status} />
      </ReviewSection>
    </div>
  );
};
