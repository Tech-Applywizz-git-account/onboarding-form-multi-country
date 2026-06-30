import React, { useState } from "react";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { FormVals } from "../schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Step6Props {
  watch: UseFormWatch<FormVals>;
  setStep: (step: number) => void;
  resumeFile: File | null;
  coverLetterFile: File | null;
  setValue: UseFormSetValue<FormVals>;
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
  setValue,
}) => {
  const data = watch();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

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
        <ReviewItem label="Job Application Email" value={data.company_email} />
        <ReviewItem label="Primary Phone" value={data.primary_phone} />
        <ReviewItem label="WhatsApp Number" value={data.whatsapp_number} />
        <ReviewItem label="Date of Birth" value={data.date_of_birth} />
        <ReviewItem label="Country" value={data.zip_or_country === "Other" ? data.other_country : data.zip_or_country} />
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
        <ReviewItem label="Salary Expectations (Yearly)" value={`${data.salary_currency} ${data.salary_expectations_yearly}`} />
        <ReviewItem label="Salary Expectations (Hourly)" value={`${data.salary_currency} ${data.salary_expectations_hourly}`} />
        <ReviewItem label="Work Preferences" value={data.work_preferences?.join(", ")} fullWidth />
        <ReviewItem 
          label="Job Role Preferences" 
          value={data.job_role_preferences?.map(role => role === "Other" && data.job_role_other ? `Other - ${data.job_role_other}` : role).join(", ")} 
          fullWidth 
        />
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

      <div className="mt-8 border-t border-slate-200 pt-6">
        {watch("terms_accepted") ? (
          <div className="flex items-center space-x-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-200 animate-in fade-in">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <span className="text-sm font-medium">
              You have read, understood, and agreed to the Terms & Conditions, and authorized ApplyWizz to process your information.
            </span>
          </div>
        ) : (
          <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <Checkbox 
              id="terms_accepted" 
              checked={watch("terms_accepted")}
              onCheckedChange={(checked) => setValue("terms_accepted", checked === true)}
              className="mt-1"
            />
            <div className="space-y-1 leading-none">
              <label
                htmlFor="terms_accepted"
                className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
              >
                I have read, understood, and agree to the{" "}
                <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
                  <DialogTrigger onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="text-blue-600 font-bold hover:underline">
                    Terms & Conditions
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
                    <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                      <DialogTitle className="text-lg font-bold text-slate-800">Terms & Conditions</DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-4 text-[12px] text-slate-600 space-y-4">
                      <p className="font-medium text-slate-700">By proceeding with this onboarding form, you acknowledge and agree to the following:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>I confirm that all information, documents, resume(s), employment history, educational qualifications, visa details, work authorization, and contact information provided by me are accurate, complete, and up to date.</li>
                        <li>I authorize ApplyWizz to use the information and documents submitted through this onboarding form to identify suitable job opportunities and submit job applications on my behalf through authorized employer career portals, recruitment platforms, and other approved hiring channels.</li>
                        <li>I understand that ApplyWizz provides job application assistance, resume optimization, LinkedIn branding, and career support services only. ApplyWizz does not guarantee interviews, job offers, employment, salary, visa sponsorship, or any specific hiring outcome.</li>
                        <li>I authorize ApplyWizz to optimize, format, tailor, or reorganize my resume and application responses to improve readability and align them with specific job requirements without misrepresenting my qualifications, experience, or professional background.</li>
                        <li>I understand that ApplyWizz may use AI-powered tools and automation to assist with resume optimization, job matching, and job application services while maintaining the accuracy of my profile and information. All outputs are subject to human review and service processes where applicable.</li>
                        <li>I agree to promptly notify ApplyWizz if there are any changes to my employment status, work authorization, visa status, resume, contact details, or any other information that may impact my job applications.</li>
                        <li>I understand that timely submission of requested documents, information, approvals, and responses is my responsibility. Any delay from my end may impact the efficiency and effectiveness of the services provided.</li>
                        <li>I understand that interview invitations, interview scheduling, hiring decisions, salary negotiations, and employment offers are solely at the discretion of the respective employers. ApplyWizz has no control over these decisions.</li>
                        <li>I acknowledge that the success of my job search depends on several external factors, including employer requirements, market demand, my qualifications, experience, interview performance, and overall competitiveness.</li>
                        <li>I understand that providing false, misleading, incomplete, or fraudulent information may result in the suspension or termination of the services without prior notice.</li>
                        <li>I authorize ApplyWizz to securely store, process, and use my personal information solely for providing job application assistance and career support services in accordance with its Privacy Policy.</li>
                        <li>I understand that while ApplyWizz follows reasonable industry-standard security practices to protect my information, no online platform can guarantee absolute security of electronic data.</li>
                        <li>I agree not to use ApplyWizz's services for any unlawful, fraudulent, or unauthorized purpose.</li>
                        <li>I understand that subscription fees, renewals, cancellations, and refunds are governed by ApplyWizz's applicable Subscription, Billing, Cancellation, and Refund Policies.</li>
                        <li>I authorize ApplyWizz to contact me via email, phone calls, SMS, WhatsApp, or other messaging platforms regarding job applications, interviews, profile updates, subscription-related information, and other service communications.</li>
                        <li>I understand that ApplyWizz will make reasonable efforts to avoid duplicate job applications. I also agree to promptly inform ApplyWizz if I have independently applied for any position that may overlap with applications being managed on my behalf.</li>
                        <li>I acknowledge that once ApplyWizz has commenced providing the subscribed services, the applicable fees shall be non-refundable except where required under applicable law or as specified in ApplyWizz's Refund Policy.</li>
                      </ul>
                      <p className="pt-2 font-medium">By clicking "I Agree" below, I confirm that I have carefully read, understood, and agree to these Terms & Conditions.</p>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10 flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsTermsOpen(false)}>Cancel</Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8" onClick={() => { setValue("terms_accepted", true, { shouldValidate: true }); setIsTermsOpen(false); }}>
                        I Agree
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                {" "}and authorize ApplyWizz to process my information for the purpose of providing job application assistance and career support services.
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
