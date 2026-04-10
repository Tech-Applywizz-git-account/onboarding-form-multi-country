import React from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormVals } from "../schema";
import { YesNoField } from "./YesNoField";

interface Step2Props {
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
}

export const Step2Eligibility: React.FC<Step2Props> = ({
  watch,
  setValue,
}) => {
  return (
    <div className="space-y-6">
      <YesNoField 
        id="is_over_18" 
        label="Are you at least 18 years of age?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="eligible_to_work_in_us" 
        label="Are you eligible to work in the United States?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="authorized_without_visa" 
        label="Are you legally authorized to work in the United States without a visa or sponsorship?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="require_future_sponsorship" 
        label="Will you now or in the future require sponsorship for employment in the United States?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="can_perform_essential_functions" 
        label="Are you able to perform the essential functions of the job with or without reasonable accommodation?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="worked_for_company_before" 
        label="Have you ever worked for our company before?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="discharged_for_policy_violation" 
        label="Have you ever been discharged or forced to resign from any position for a violation of company policy?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="referred_by_agency" 
        label="Were you referred to us by a recruitment agency?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
    </div>
  );
};
