import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormVals } from "../schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreatableSelect } from "@/components/CreatableSelect";
import { YesNoField } from "./YesNoField";
import { FormField } from "./FormField";
import { US_STATES } from "../constants";

interface Step5Props {
  register: UseFormRegister<FormVals>;
  errors: FieldErrors<FormVals>;
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
}

export const Step5Demographics: React.FC<Step5Props> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const hasRelatives = watch("has_relatives_in_company");

  return (
    <div className="space-y-6">
      <FormField id="gender" label="Gender" required error={errors.gender}>
        <Select
          value={watch("gender") || ""}
          onValueChange={(v) => setValue("gender", v, { shouldValidate: true })}
        >
          <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Non-Binary</SelectItem>
            <SelectItem value="Prefer Not to Say">Decline to Self-Identify</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="is_hispanic_latino" label="Are you Hispanic/Latino?" required error={errors.is_hispanic_latino}>
        <Select
          value={watch("is_hispanic_latino") || ""}
          onValueChange={(v) => setValue("is_hispanic_latino", v, { shouldValidate: true })}
        >
          <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="Decline to Self-Identify">Decline to Self-Identify</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="race_ethnicity" label="Race/Ethnicity" required error={errors.race_ethnicity}>
        <Select
          value={watch("race_ethnicity") || ""}
          onValueChange={(v) => setValue("race_ethnicity", v, { shouldValidate: true })}
        >
          <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {[
              "White",
              "Black or African American",
              "Asian",
              "Native Hawaiian or Other Pacific Islander",
              "American Indian or Alaska Native",
              "Two or More Races",
              "I don’t wish to answer",
            ].map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="veteran_status" label="Veteran Status" required error={errors.veteran_status}>
        <Select
          value={watch("veteran_status") || ""}
          onValueChange={(v) => setValue("veteran_status", v, { shouldValidate: true })}
        >
          <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="I identify as one or more classifications of a protected veteran">
              I identify as one or more classifications of a protected veteran
            </SelectItem>
            <SelectItem value="I am not a protected veteran">
              I am not a protected veteran
            </SelectItem>
            <SelectItem value="I don’t wish to answer">I don’t wish to answer</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="disability_status" label="Disability Status" required error={errors.disability_status}>
        <Select
          value={watch("disability_status") || ""}
          onValueChange={(v) => setValue("disability_status", v, { shouldValidate: true })}
        >
          <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes, I have (or have had) a disability">
              Yes, I have (or have had) a disability
            </SelectItem>
            <SelectItem value="No, I do not have a disability">
              No, I do not have a disability
            </SelectItem>
            <SelectItem value="I don’t wish to answer">I don’t wish to answer</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="space-y-4">
        <YesNoField
          id="has_relatives_in_company"
          label="If any job application asks ‘Do you have any relatives in this company?’, what should we answer? (recommended - No)"
          required
          watch={watch}
          setValue={setValue}
        />
        {hasRelatives === "yes" && (
          <FormField
            id="relatives_details"
            label="Please specify name and department:"
            required
            error={errors.relatives_details}
            className="md:ml-6 border-l-2 border-blue-100 pl-4 py-2"
          >
            <Textarea
              {...register("relatives_details")}
              className="border-slate-300 focus:border-blue-500 focus:ring-0 bg-white"
            />
          </FormField>
        )}
      </div>
    </div>
  );
};
