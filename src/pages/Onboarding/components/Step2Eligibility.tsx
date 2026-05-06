import React from "react";
import { UseFormSetValue, UseFormWatch, UseFormRegister, FieldErrors } from "react-hook-form";
import { FormVals } from "../schema";
import { YesNoField } from "./YesNoField";
import { FormField } from "./FormField";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step2Props {
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
  register: UseFormRegister<FormVals>;
  errors: FieldErrors<FormVals>;
}

export const Step2Eligibility: React.FC<Step2Props> = ({
  watch,
  setValue,
  register,
  errors,
}) => {
  const selectedCountry = watch("zip_or_country");
  const otherCountry = watch("other_country");
  const displayCountryName = selectedCountry === "Other"
    ? (otherCountry && otherCountry.trim() ? otherCountry.trim() : "the selected country")
    : (selectedCountry || "the country");
  const visatype = watch("visatype");

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
        label={`Are you eligible to work in ${displayCountryName}?`} 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="authorized_without_visa" 
        label={`Are you legally authorized to work in ${displayCountryName} without a visa or sponsorship?`} 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="require_future_sponsorship" 
        label={`Will you now or in the future require sponsorship for employment in ${displayCountryName}?`} 
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
