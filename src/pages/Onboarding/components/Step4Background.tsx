import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormVals } from "../schema";
import { Textarea } from "@/components/ui/textarea";
import { YesNoField } from "./YesNoField";
import { FormField } from "./FormField";

interface Step4Props {
  register: UseFormRegister<FormVals>;
  errors: FieldErrors<FormVals>;
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
}

export const Step4Background: React.FC<Step4Props> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const convictedOfFelony = watch("convicted_of_felony");
  const usesSubstances = watch("uses_substances_affecting_duties");

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <YesNoField 
          id="convicted_of_felony" 
          label="Have you ever been convicted of a felony or misdemeanor (excluding minor traffic violations)?" 
          required
          watch={watch} 
          setValue={setValue} 
        />
        {convictedOfFelony === "yes" && (
          <FormField 
            id="felony_explanation" 
            label="Please explain:" 
            required 
            error={errors.felony_explanation}
            className="md:ml-6 border-l-2 border-blue-100 pl-4 py-2"
          >
            <Textarea
              {...register("felony_explanation")}
              className="border-slate-300 focus:border-blue-500 focus:ring-0 bg-white"
            />
          </FormField>
        )}
      </div>

      <YesNoField 
        id="pending_investigation" 
        label="Have you ever been involved in any pending criminal investigation or lawsuit related to workplace conduct?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      
      <YesNoField 
        id="willing_background_check" 
        label="Are you willing to submit to a background verification check if offered employment?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      
      <YesNoField 
        id="willing_drug_screen" 
        label="Are you willing to undergo a drug screening test as part of the pre-employment process?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      
      <YesNoField 
        id="failed_or_refused_drug_test" 
        label="Have you ever failed or refused a drug test for any previous employer?" 
        required
        watch={watch} 
        setValue={setValue} 
      />

      <div className="space-y-4">
        <YesNoField 
          id="uses_substances_affecting_duties" 
          label="Do you currently use any substances (prescription or otherwise) that may affect your ability to perform essential job duties?" 
          required
          watch={watch} 
          setValue={setValue} 
        />
        {usesSubstances === "yes" && (
          <FormField 
            id="substances_description" 
            label="Please describe:" 
            required 
            error={errors.substances_description}
            className="md:ml-6 border-l-2 border-blue-100 pl-4 py-2"
          >
            <Textarea
              {...register("substances_description")}
              className="border-slate-300 focus:border-blue-500 focus:ring-0 bg-white"
            />
          </FormField>
        )}
      </div>

      <YesNoField 
        id="can_provide_legal_docs" 
        label="Are you able to provide legal documentation (ID, SSN, or Work Authorization) for employment verification?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
    </div>
  );
};
