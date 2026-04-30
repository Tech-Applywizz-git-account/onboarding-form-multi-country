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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { YesNoField } from "./YesNoField";
import { FormField } from "./FormField";

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
  const selectedCountry = watch("zip_or_country");
  const isUS = selectedCountry === "United States";
  const isCanada = selectedCountry === "Canada";
  const isUK = selectedCountry === "United Kingdom";

  return (
    <div className="space-y-8">
      {/* Identity Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
          Identity & Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField id="gender" label="Gender" required error={errors.gender}>
            <Select
              value={watch("gender") || ""}
              onValueChange={(v) => setValue("gender", v, { shouldValidate: true })}
            >
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Non-Binary">Non-Binary</SelectItem>
                <SelectItem value="Prefer Not to Say">Decline to Self-Identify</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="pronouns" label="Pronoun" error={errors.pronouns}>
            <Select
              value={watch("pronouns") || ""}
              onValueChange={(v) => setValue("pronouns", v, { shouldValidate: true })}
            >
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
                <SelectValue placeholder="Select Pronoun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="He/Him">He/Him</SelectItem>
                <SelectItem value="She/Her">She/Her</SelectItem>
                <SelectItem value="They/Them">They/Them</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField id="gender_identity" label="Gender Identity" error={errors.gender_identity}>
            <Select
              value={watch("gender_identity") || ""}
              onValueChange={(v) => setValue("gender_identity", v, { shouldValidate: true })}
            >
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
                <SelectValue placeholder="Select Identity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cisgender">Cisgender</SelectItem>
                <SelectItem value="Transgender">Transgender</SelectItem>
                <SelectItem value="Non-Binary">Non-Binary</SelectItem>
                <SelectItem value="Genderqueer/Genderfluid">Genderqueer/Genderfluid</SelectItem>
                <SelectItem value="Prefer Not to Say">Decline to Self-Identify</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="sexual_orientation" label="Sexual Orientation" error={errors.sexual_orientation}>
            <Select
              value={watch("sexual_orientation") || ""}
              onValueChange={(v) => setValue("sexual_orientation", v, { shouldValidate: true })}
            >
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
                <SelectValue placeholder="Select Orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Heterosexual">Heterosexual</SelectItem>
                <SelectItem value="Gay or Lesbian">Gay or Lesbian</SelectItem>
                <SelectItem value="Bisexual">Bisexual</SelectItem>
                <SelectItem value="Asexual">Asexual</SelectItem>
                <SelectItem value="Pansexual">Pansexual</SelectItem>
                <SelectItem value="Queer">Queer</SelectItem>
                <SelectItem value="Prefer Not to Say">Decline to Self-Identify</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Location & Professional Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <span className="h-2 w-2 bg-green-500 rounded-full"></span>
          Location & Professional
        </h3>

        <FormField id="current_country_timezone" label="What country and time zone are you based in?" required error={errors.current_country_timezone}>
          <Select
            value={watch("current_country_timezone") || ""}
            onValueChange={(v) => setValue("current_country_timezone", v, { shouldValidate: true })}
          >
            <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
              <SelectValue placeholder="Select Country & Timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA (EST)">USA (EST - Eastern)</SelectItem>
              <SelectItem value="USA (CST)">USA (CST - Central)</SelectItem>
              <SelectItem value="USA (MST)">USA (MST - Mountain)</SelectItem>
              <SelectItem value="USA (PST)">USA (PST - Pacific)</SelectItem>
              <SelectItem value="Canada (EST)">Canada (EST)</SelectItem>
              <SelectItem value="Canada (CST)">Canada (CST)</SelectItem>
              <SelectItem value="Canada (MST)">Canada (MST)</SelectItem>
              <SelectItem value="Canada (PST)">Canada (PST)</SelectItem>
              <SelectItem value="UK (GMT/BST)">UK (GMT/BST)</SelectItem>
              <SelectItem value="Ireland (GMT/IST)">Ireland (GMT/IST)</SelectItem>
              <SelectItem value="Other">Other / Not Listed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isCanada && (
            <FormField id="province_territory" label="Province Or Territory" required error={errors.province_territory}>
              <Input {...register("province_territory")} placeholder="e.g. Ontario" className="h-11 border-slate-200 bg-white" />
            </FormField>
          )}
          {isUK && (
            <FormField id="county" label="County" required error={errors.county}>
              <Input {...register("county")} placeholder="e.g. Yorkshire" className="h-11 border-slate-200 bg-white" />
            </FormField>
          )}
          {isUK && (
            <FormField id="religion" label="Religion" error={errors.religion}>
              <Input {...register("religion")} placeholder="Enter religion" className="h-11 border-slate-200 bg-white" />
            </FormField>
          )}
        </div>

        <YesNoField
          id="financial_licenses"
          label="Do you currently hold or have you ever held any licenses or registrations relevant to the financial services industry?"
          required
          watch={watch}
          setValue={setValue}
        />
      </div>

      {/* EEO Section (Conditional for US) */}
      {(isUS || (!isCanada && !isUK && selectedCountry !== "Ireland")) && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="h-2 w-2 bg-orange-500 rounded-full"></span>
            Equal Employment Opportunity (EEO)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField id="is_hispanic_latino" label="Are you Hispanic/Latino?" error={errors.is_hispanic_latino}>
              <Select
                value={watch("is_hispanic_latino") || ""}
                onValueChange={(v) => setValue("is_hispanic_latino", v, { shouldValidate: true })}
              >
                <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Decline to Self-Identify">Decline to Self-Identify</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="race_ethnicity" label="Race/Ethnicity" error={errors.race_ethnicity}>
              <Select
                value={watch("race_ethnicity") || ""}
                onValueChange={(v) => setValue("race_ethnicity", v, { shouldValidate: true })}
              >
                <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
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
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField id="veteran_status" label="Veteran Status" error={errors.veteran_status}>
            <Select
              value={watch("veteran_status") || ""}
              onValueChange={(v) => setValue("veteran_status", v, { shouldValidate: true })}
            >
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="I identify as one or more classifications of a protected veteran">I identify as one or more classifications of a protected veteran</SelectItem>
                <SelectItem value="I am not a protected veteran">I am not a protected veteran</SelectItem>
                <SelectItem value="I don’t wish to answer">I don’t wish to answer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      )}

      {/* General Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
          Additional Information
        </h3>

        <FormField id="disability_status" label="Disability Status" required error={errors.disability_status}>
          <Select
            value={watch("disability_status") || ""}
            onValueChange={(v) => setValue("disability_status", v, { shouldValidate: true })}
          >
            <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes, I have (or have had) a disability">Yes, I have (or have had) a disability</SelectItem>
              <SelectItem value="No, I do not have a disability">No, I do not have a disability</SelectItem>
              <SelectItem value="I don’t wish to answer">I don’t wish to answer</SelectItem>
            </SelectContent>
          </Select>
        </FormField>


      </div>
    </div>
  );
};
