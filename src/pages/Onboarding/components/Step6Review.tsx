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
    <div className="space-y-8">
      <div className="bg-blue-600 border border-blue-700 rounded-xl p-6 text-white shadow-lg shadow-blue-200/50 animate-in fade-in slide-in-from-top-4 duration-500">
        <h3 className="font-bold text-xl mb-2">Almost there!</h3>
        <p className="text-blue-100 text-sm opacity-90">
          Please review your information carefully before submitting. You can click <strong>"Edit"</strong> on any section to make changes.
        </p>
      </div>

      <ReviewSection title="Personal Information" step={1} onEdit={setStep}>
        <ReviewItem label="Full Name" value={`${data.first_name} ${data.middle_name || ""} ${data.last_name}`} />
        <ReviewItem label="Email" value={data.personal_email} />
        <ReviewItem label="Primary Phone" value={data.primary_phone} />
        <ReviewItem label="Callable Phone" value={data.callable_phone} />
        <ReviewItem label="WhatsApp" value={data.whatsapp_number} />
        <ReviewItem label="Date of Birth" value={data.date_of_birth} />
        <ReviewItem label="Address" value={data.full_address} fullWidth />
        <ReviewItem label="Country" value={data.zip_or_country} />
        <ReviewItem label="Visa Type" value={data.visatype === "Other" ? data.visatype_other : data.visatype} />
        <ReviewItem label="LinkedIn" value={data.linkedin_url} />
        <ReviewItem label="GitHub" value={data.github_url} />
        <ReviewItem label="Portfolio" value={data.portfolio_url} />
        <ReviewItem label="Resume" value={resumeFile?.name} />
        <ReviewItem label="Cover Letter" value={coverLetterFile?.name} />
      </ReviewSection>

      <ReviewSection title="Eligibility & Authorization" step={2} onEdit={setStep}>
        <ReviewItem label="18+ Years Old" value={data.is_over_18 === "yes" ? "Yes" : "No"} />
        <ReviewItem label="US Eligibility" value={data.eligible_to_work_in_us === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Work Auth without Visa" value={data.authorized_without_visa === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Future Sponsorship" value={data.require_future_sponsorship === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Perform Essential Functions" value={data.can_perform_essential_functions === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Previous Employee" value={data.worked_for_company_before === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Discharged for Policy" value={data.discharged_for_policy_violation === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Referred by Agency" value={data.referred_by_agency === "yes" ? "Yes" : "No"} />
      </ReviewSection>

      <ReviewSection title="Education & Experience" step={3} onEdit={setStep}>
        <ReviewItem label="Highest Education" value={data.highest_education} />
        <ReviewItem label="University" value={data.university_name} />
        <ReviewItem label="Major" value={data.main_subject} />
        <ReviewItem label="Graduation Year" value={data.graduation_year} />
        <ReviewItem label="GPA" value={data.cumulative_gpa} />
        <ReviewItem label="Education %" value={data.education_percentage} />
        <ReviewItem label="Experience" value={`${data.experience} Year(s)`} />
        <ReviewItem label="Employment Status" value={data.employment_status} />
        <ReviewItem label="Salary Expectation" value={`$${data.salary_expectations}`} />
        <ReviewItem label="Desired Start Date" value={data.desired_start_date} />
        <ReviewItem label="Notice Period" value={data.notice_period} />
        <ReviewItem label="Work Preference" value={data.work_preferences} />
        <ReviewItem label="Job Roles" value={data.job_role_preferences?.join(", ")} fullWidth />
        <ReviewItem label="Location Preferences" value={data.location_preferences?.join(", ")} fullWidth />
        {data.alternate_job_roles && <ReviewItem label="Alternate Roles" value={data.alternate_job_roles} fullWidth />}
        {data.exclude_companies && <ReviewItem label="Excluded Companies" value={data.exclude_companies} fullWidth />}
        
        {data.employment_status === "Employed" && (
          <div className="col-span-full mt-2 p-4 bg-blue-50/50 rounded-lg border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
             <ReviewItem label="Recent Job Title" value={data.recent_job_title} />
             <ReviewItem label="Company" value={data.recent_company_name} />
             <ReviewItem label="Currently Working" value={data.working_status ? "Yes" : "No"} />
             <ReviewItem label="Start Date" value={data.employment_start_date} />
             <ReviewItem label="End Date" value={data.employment_end_date} />
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Background & Screening" step={4} onEdit={setStep}>
        <ReviewItem label="Convicted of Felony" value={data.convicted_of_felony === "yes" ? "Yes" : "No"} />
        {data.convicted_of_felony === "yes" && <ReviewItem label="Explanation" value={data.felony_explanation} fullWidth />}
        <ReviewItem label="Pending Investigation" value={data.pending_investigation === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Willing to background check" value={data.willing_background_check === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Willing to drug screen" value={data.willing_drug_screen === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Failed drug test" value={data.failed_or_refused_drug_test === "yes" ? "Yes" : "No"} />
        <ReviewItem label="Substances affecting duties" value={data.uses_substances_affecting_duties === "yes" ? "Yes" : "No"} />
        {data.uses_substances_affecting_duties === "yes" && <ReviewItem label="Description" value={data.substances_description} fullWidth />}
        <ReviewItem label="Can provide legal docs" value={data.can_provide_legal_docs === "yes" ? "Yes" : "No"} />
      </ReviewSection>

      <ReviewSection title="Demographics" step={5} onEdit={setStep}>
        <ReviewItem label="Gender" value={data.gender} />
        <ReviewItem label="Hispanic/Latino" value={data.is_hispanic_latino} />
        <ReviewItem label="Race/Ethnicity" value={data.race_ethnicity} />
        <ReviewItem label="Veteran Status" value={data.veteran_status} />
        <ReviewItem label="Disability Status" value={data.disability_status} />
        <ReviewItem label="Relatives in Company" value={data.has_relatives_in_company === "yes" ? "Yes" : "No"} />
        {data.has_relatives_in_company === "yes" && <ReviewItem label="Relative Details" value={data.relatives_details} fullWidth />}
      </ReviewSection>
    </div>
  );
};
