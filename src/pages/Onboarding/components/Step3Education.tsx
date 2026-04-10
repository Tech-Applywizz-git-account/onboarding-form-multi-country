import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormVals } from "../schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MultiSelect from "@/components/MultiSelect";
import { FormField } from "./FormField";
import { YesNoField } from "./YesNoField";
import { salaryOptions, jobRoleOptions, locationOptions } from "../constants";

interface Step3Props {
  register: UseFormRegister<FormVals>;
  errors: FieldErrors<FormVals>;
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
  jobRolesLoading: boolean;
  jobRolesData: any[]; // Simplified type for now
  alternateRolesOptions: string[];
  toast: any;
}

export const Step3Education: React.FC<Step3Props> = ({
  register,
  errors,
  watch,
  setValue,
  jobRolesLoading,
  jobRolesData,
  alternateRolesOptions,
  toast,
}) => {
  const jobRoles = watch("job_role_preferences") || [];
  const locations = watch("location_preferences") || [];
  const employmentStatus = watch("employment_status");
  const isCurrentlyWorking = watch("working_status");

  return (
    <div className="space-y-6">
      <FormField id="highest_education" label="Highest Level of Education" required error={errors.highest_education}>
        <Select
          value={watch("highest_education") || ""}
          onValueChange={(v) => setValue("highest_education", v, { shouldValidate: true })}
        >
          <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
            <SelectValue placeholder="Select Education Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High School Diploma / GED">High School Diploma / GED</SelectItem>
            <SelectItem value="Associate Degree">Associate Degree</SelectItem>
            <SelectItem value="Bachelor’s Degree">Bachelor’s Degree</SelectItem>
            <SelectItem value="Master’s Degree">Master’s Degree</SelectItem>
            <SelectItem value="Doctorate / PhD">Doctorate / PhD</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="university_name" label="University Name" required error={errors.university_name}>
          <Input
            {...register("university_name")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
        <FormField id="main_subject" label="Main Subject / Major" required error={errors.main_subject}>
          <Input
            {...register("main_subject")}
            placeholder="e.g., Computer Science, Business Analytics"
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="graduation_year" label="Year of Graduation" required error={errors.graduation_year}>
          <Input
            type="number"
            {...register("graduation_year")}
            placeholder="e.g., 2024"
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>

        <FormField id="cumulative_gpa" label="Cumulative GPA" required error={errors.cumulative_gpa}>
          <Input
            {...register("cumulative_gpa")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="education_percentage" label="Education Percentage/GPA" required error={errors.education_percentage}>
          <Input
            {...register("education_percentage")}
            type="number"
            step="0.01"
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>


        <FormField id="salary_expectations" label="Salary Expectations (Yearly)" required error={errors.salary_expectations}>
          <Select
            value={watch("salary_expectations") || ""}
            onValueChange={(v) => setValue("salary_expectations", v, { shouldValidate: true })}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder="Select Salary Range" />
            </SelectTrigger>
            <SelectContent>
              {salaryOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <YesNoField
          id="willing_to_relocate"
          label="Are you willing to relocate?"
          required
          watch={watch}
          setValue={setValue}
        />
        <YesNoField
          id="can_work_3_days_in_office"
          label="Can you work 3 days in office?"
          required
          watch={watch}
          setValue={setValue}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


        <FormField id="desired_start_date" label="Desired Joining Date (if you got selected in any company)" required error={errors.desired_start_date}>
          <Input
            type="date"
            {...register("desired_start_date")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
        <FormField id="work_preferences" label="Work Preferences" required error={errors.work_preferences}>
          <Select
            value={watch("work_preferences") || ""}
            onValueChange={(v) => setValue("work_preferences", v, { shouldValidate: true })}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder="Select Preferences" />
            </SelectTrigger>
            <SelectContent>
              {["All", "On-site", "Remote", "Hybrid"].map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="job_role_preferences" label="Job Role Preference" required error={errors.job_role_preferences as any}>
          <Select
            disabled={jobRolesLoading}
            value={jobRoles && jobRoles.length > 0 ? jobRoles[0] : ""}
            onValueChange={(v) => {
              setValue("job_role_preferences", [v], { shouldValidate: true });
              if (v !== "Other") {
                setValue("job_role_other", "", { shouldValidate: false });
              }
            }}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder={jobRolesLoading ? "Loading..." : "Select Preferred Role"} />
            </SelectTrigger>
            <SelectContent>
              {(jobRolesData.length > 0 ? jobRolesData : jobRoleOptions).map((o) => (
                <SelectItem key={'id' in o ? o.id : o.value} value={'name' in o ? o.name : o.value}>
                  {'name' in o ? o.name : o.label}
                </SelectItem>
              ))}
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {jobRoles && jobRoles.length > 0 && jobRoles[0] === "Other" && (
            <div className="mt-2">
              <Input
                {...register("job_role_other")}
                placeholder="Enter custom role"
                className="border-slate-300 focus:border-blue-500 focus:ring-0"
                onChange={(e) => {
                  const titleCase = e.target.value
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  setValue("job_role_other", titleCase, { shouldValidate: true });
                }}
              />
            </div>
          )}
        </FormField>

        <div className="space-y-2">
          <MultiSelect
            label="Location Preferences *"
            options={locationOptions}
            selected={locations}
            onSelectionChange={(arr) =>
              setValue("location_preferences", arr, { shouldValidate: true })
            }
          />
          {errors.location_preferences && (
            <p className="text-sm text-destructive">{errors.location_preferences.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {alternateRolesOptions.length > 0 ? (
          <div className="space-y-2">
            <MultiSelect
              label={`Alternate Job Roles (max 3) ${alternateRolesOptions.length > 0 ? "*" : ""}`}
              options={alternateRolesOptions.map(role => ({ value: role, label: role }))}
              selected={watch("alternate_job_roles") ? watch("alternate_job_roles")!.split(",").filter(Boolean) : []}
              onSelectionChange={(arr) => {
                if (arr.length > 3) {
                  return toast({
                    title: "Limit",
                    description: "You can select up to 3 alternate job roles.",
                    variant: "destructive",
                  });
                }
                setValue("alternate_job_roles", arr.join(",") || "", { shouldValidate: true });
              }}
            />
            {errors.alternate_job_roles && (
              <p className="text-sm text-destructive">{errors.alternate_job_roles.message}</p>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-3 bg-slate-50 rounded-md border border-slate-200">
            <p className="text-sm font-medium text-slate-700">Alternate Job Roles</p>
            <p className="text-xs text-muted-foreground italic">No alternate roles available for the selected job role.</p>
          </div>
        )}
      </div>

      <FormField id="exclude_companies" label="Exclude Companies" error={errors.exclude_companies}>
        <Input
          {...register("exclude_companies")}
          className="border-slate-300 focus:border-blue-500 focus:ring-0"
          placeholder="e.g., Google, Meta, Amazon"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <YesNoField
          id="willing_to_travel"
          label="Willing to travel for business?"
          required
          watch={watch}
          setValue={setValue}
        />
        <FormField id="notice_period" label="Notice Period" required error={errors.notice_period}>
          <Input
            {...register("notice_period")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
            placeholder="e.g., 2 weeks, Immediate"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="experience" label="Experience (Years)" required error={errors.experience}>
          <Select
            value={watch("experience") || ""}
            onValueChange={(v) => setValue("experience", v, { shouldValidate: true })}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder="Select Experience" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(51).keys()].map((i) => (
                <SelectItem key={i} value={`${i}`}>
                  {i} year{i !== 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="employment_status" label="Employment Status" required error={errors.employment_status}>
          <Select
            value={employmentStatus || ""}
            onValueChange={(v) => setValue("employment_status", v as "Employed" | "Unemployed", { shouldValidate: true })}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Unemployed">Unemployed</SelectItem>
              <SelectItem value="Employed">Employed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {employmentStatus === "Employed" && (
        <div className="space-y-4 p-5 border border-blue-200 rounded-xl bg-blue-50/20 shadow-sm animate-in fade-in zoom-in-95">
          <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-2 mb-4">Employment History</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField id="recent_job_title" label="Recent Job Title" required error={errors.recent_job_title}>
              <Input
                {...register("recent_job_title")}
                placeholder="e.g., Software Engineer"
                className="border-slate-300 focus:border-blue-500 focus:ring-0 bg-white"
              />
            </FormField>
            <FormField id="recent_company_name" label="Company Name" required error={errors.recent_company_name}>
              <Input
                {...register("recent_company_name")}
                placeholder="Enter company name"
                className="border-slate-300 focus:border-blue-500 focus:ring-0 bg-white"
              />
            </FormField>
          </div>
          <div className="flex flex-col justify-end pb-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="working_status"
                checked={isCurrentlyWorking || false}
                onCheckedChange={(checked) => {
                  setValue("working_status", !!checked, { shouldValidate: true });
                  if (checked) {
                    setValue("employment_end_date", "", { shouldValidate: true });
                  }
                }}
              />
              <Label htmlFor="working_status" className="text-sm font-medium leading-none cursor-pointer">
                Currently Working
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <FormField id="employment_start_date" label="Start Date" required error={errors.employment_start_date}>
              <Input
                type="date"
                {...register("employment_start_date")}
                className="border-slate-300 focus:border-blue-500 focus:ring-0 bg-white"
              />
            </FormField>
            <FormField id="employment_end_date" label="End Date" error={errors.employment_end_date}>
              <Input
                type="date"
                disabled={isCurrentlyWorking}
                {...register("employment_end_date")}
                className="border-slate-300 focus:border-blue-500 focus:ring-0 bg-white disabled:opacity-50 disabled:bg-slate-100"
              />
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
};
