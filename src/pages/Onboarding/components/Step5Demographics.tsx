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

import { 
  RELIGIONS, 
  CANADIAN_PROVINCES, 
  UK_COUNTIES, 
  IRELAND_COUNTIES,
  USA_STATES,
  GENDER_OPTIONS
} from "../constants";

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
  const selectedCountry = watch("zip_or_country");
  const isUS = selectedCountry === "United States";
  const isCanada = selectedCountry === "Canada";
  const isUK = selectedCountry === "United Kingdom";
  const isIreland = selectedCountry === "Ireland";

  // Dynamic lists for County
  const getCountyOptions = () => {
    if (isUK) return UK_COUNTIES;
    if (isIreland) return IRELAND_COUNTIES;
    return [];
  };

  const countyOptions = getCountyOptions();

  return (
    <div className="space-y-8">
      {/* Identity Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
          Identity & Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FormField id="gender" label="Gender" required error={errors.gender}>
              <Select
                value={watch("gender") || ""}
                onValueChange={(v) => setValue("gender", v, { shouldValidate: true })}
              >
                <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-0 h-11 bg-white">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            {watch("gender") === "Other" && (
              <Input {...register("gender_other")} placeholder="Specify gender" className="h-10 border-slate-200 animate-in fade-in slide-in-from-top-2" />
            )}
          </div>

          <div className="space-y-2">
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
            {watch("pronouns") === "Other" && (
              <Input {...register("pronouns_other")} placeholder="Specify pronouns" className="h-10 border-slate-200 animate-in fade-in slide-in-from-top-2" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
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
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            {watch("current_country_timezone") === "Other" && (
              <Input {...register("current_country_timezone_other")} placeholder="Specify location & timezone" className="h-10 border-slate-200 animate-in fade-in slide-in-from-top-2" />
            )}
          </div>

          {(isCanada || isUS) && (
            <div className="space-y-2">
              <FormField 
                id="province_territory" 
                label={isCanada ? "Province Or Territory" : "State"} 
                required={isCanada} 
                error={errors.province_territory}
              >
                <Select
                  value={watch("province_territory") || ""}
                  onValueChange={(v) => setValue("province_territory", v, { shouldValidate: isCanada })}
                >
                  <SelectTrigger className="border-slate-200 h-11 bg-white">
                    <SelectValue placeholder={isCanada ? "Select Province" : "Select State"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(isCanada ? CANADIAN_PROVINCES : USA_STATES).map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              {watch("province_territory") === "Other" && (
                <Input {...register("province_territory_other")} placeholder="Specify location" className="h-10 border-slate-200 animate-in fade-in slide-in-from-top-2" />
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <FormField id="county" label="County" required={isUK} error={errors.county}>
              {countyOptions.length > 0 ? (
                <Select
                  value={watch("county") || ""}
                  onValueChange={(v) => setValue("county", v, { shouldValidate: isUK })}
                >
                  <SelectTrigger className="border-slate-200 h-11 bg-white">
                    <SelectValue placeholder="Select County" />
                  </SelectTrigger>
                  <SelectContent>
                    {countyOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input {...register("county")} placeholder="Enter county" className="h-11 border-slate-200 bg-white" />
              )}
            </FormField>
            {watch("county") === "Other" && (
              <Input {...register("county_other")} placeholder="Specify county" className="h-10 border-slate-200 animate-in fade-in slide-in-from-top-2" />
            )}
          </div>

          <div className="space-y-2">
            <FormField id="religion" label="Religion" error={errors.religion}>
              <Select
                value={watch("religion") || ""}
                onValueChange={(v) => setValue("religion", v, { shouldValidate: true })}
              >
                <SelectTrigger className="border-slate-200 h-11 bg-white">
                  <SelectValue placeholder="Select Religion" />
                </SelectTrigger>
                <SelectContent>
                  {RELIGIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            {watch("religion") === "Other" && (
              <Input {...register("religion_other")} placeholder="Specify religion" className="h-10 border-slate-200 animate-in fade-in slide-in-from-top-2" />
            )}
          </div>
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

            <div className="space-y-2">
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
                      "Other",
                      "I don’t wish to answer",
                    ].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              {watch("race_ethnicity") === "Other" && (
                <Input {...register("race_ethnicity_other")} placeholder="Specify race/ethnicity" className="h-10 border-slate-200 animate-in fade-in slide-in-from-top-2" />
              )}
            </div>
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
