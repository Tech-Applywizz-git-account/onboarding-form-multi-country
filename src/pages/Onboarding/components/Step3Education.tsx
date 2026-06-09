import React, { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, useFieldArray, Control } from "react-hook-form";
import { FormVals } from "../schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MultiSelect from "@/components/MultiSelect";
import { FormField } from "./FormField";
import { YesNoField } from "./YesNoField";
import { jobRoleOptions, COUNTRY_DATA, SALARY_RANGES, COUNTRY_OPTIONS, CURRENCY_OPTIONS } from "../constants";
import { fetchUniversities, fetchCompanies, fetchCities } from "../helpers";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Step3Props {
  register: UseFormRegister<FormVals>;
  errors: FieldErrors<FormVals>;
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
  control: Control<FormVals>;
  jobRolesLoading: boolean;
  jobRolesData: any[];
  alternateRolesOptions: string[];
  toast: any;
}

const YEAR_OPTIONS = Array.from({ length: 61 }, (_, i) => (new Date().getFullYear() + 5 - i).toString());

const NOTICE_PERIOD_OPTIONS = [
  "Immediately",
  "2 Weeks",
  "1 Month",
  "2 Months",
  "3 Months"

];

interface EmploymentHistoryRowProps {
  index: number;
  register: any;
  watch: any;
  setValue: any;
  remove: (index: number) => void;
  selectedCountry: string | undefined;
  jobRoleOptions: any[];
  jobRolesData: any[];
  alternateRolesOptions: string[];
  errors: FieldErrors<FormVals>;
}

const EmploymentHistoryRow: React.FC<EmploymentHistoryRowProps> = ({
  index,
  register,
  watch,
  setValue,
  remove,
  selectedCountry,
  jobRoleOptions,
  jobRolesData,
  alternateRolesOptions,
  errors,
}) => {
  const [jobSearch, setJobSearch] = useState("");
  const [jobOpen, setJobOpen] = useState(false);
  const [compSearch, setCompSearch] = useState("");
  const [compSuggestions, setCompSuggestions] = useState<string[]>([]);
  const [compLoading, setCompLoading] = useState(false);
  const [compOpen, setCompOpen] = useState(false);

  const jobTitle = watch(`employment_history.${index}.job_title`);
  const companyName = watch(`employment_history.${index}.company_name`);

  // Company Search Logic
  useEffect(() => {
    if (compSearch.length < 1) {
      setCompSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCompLoading(true);
      const results = await fetchCompanies(compSearch);
      setCompSuggestions(Array.from(new Set(results)));
      setCompLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [compSearch]);

  const allJobOptions = Array.from(new Set([
    ...(jobRolesData.length > 0 ? jobRolesData.map(o => "name" in o ? o.name : o.value) : jobRoleOptions.map(o => o.value)),
    ...alternateRolesOptions
  ]));

  return (
    <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 relative animate-in fade-in zoom-in-95">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
        onClick={() => remove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Title with Suggestions */}
        <FormField
          id={`employment_history.${index}.job_title` as any}
          label="Job Title"
          required
          error={(errors.employment_history as any)?.[index]?.job_title}
        >
          <Popover open={jobOpen} onOpenChange={setJobOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-11 border-slate-200 bg-white hover:bg-slate-50 font-normal text-left"
              >
                <span className="truncate">{jobTitle || "Select or type job title..."}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search job title..." value={jobSearch} onValueChange={setJobSearch} />
                <CommandGroup className="max-h-60 overflow-auto">
                  {allJobOptions.map((val: string) => (
                    <CommandItem
                      key={val}
                      onSelect={() => {
                        setValue(`employment_history.${index}.job_title`, val, { shouldValidate: true });
                        setJobOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", jobTitle === val ? "opacity-100" : "opacity-0")} />
                      {val}
                    </CommandItem>
                  ))}
                  <CommandItem
                    onSelect={() => {
                      const val = prompt("Enter job title:");
                      if (val) setValue(`employment_history.${index}.job_title`, val, { shouldValidate: true });
                      setJobOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Other (Type manually)
                  </CommandItem>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </FormField>

        {/* Company Name with Search & Add */}
        <FormField
          id={`employment_history.${index}.company_name` as any}
          label="Company Name"
          required
          error={(errors.employment_history as any)?.[index]?.company_name}
        >
          <Popover open={compOpen} onOpenChange={setCompOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-11 border-slate-200 bg-white hover:bg-slate-50 font-normal text-left"
              >
                <span className="truncate">{companyName || "Search or type company..."}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search company..." value={compSearch} onValueChange={setCompSearch} />
                <CommandEmpty>
                  {compLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Searching...
                    </div>
                  ) : (
                    "No companies found."
                  )}
                </CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  {compSuggestions.map((comp) => (
                    <CommandItem
                      key={comp}
                      onSelect={() => {
                        setValue(`employment_history.${index}.company_name`, comp, { shouldValidate: true });
                        setCompOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", companyName === comp ? "opacity-100" : "opacity-0")} />
                      {comp}
                    </CommandItem>
                  ))}
                  <CommandItem
                    onSelect={() => {
                      const val = prompt("Enter company name:");
                      if (val) setValue(`employment_history.${index}.company_name`, val, { shouldValidate: true });
                      setCompOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Company
                  </CommandItem>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id={`employment_history.${index}.start_date` as any}
          label="Start Date"
          required
          error={(errors.employment_history as any)?.[index]?.start_date}
        >
          <Input type="date" {...register(`employment_history.${index}.start_date` as any)} className="h-11 border-slate-200 bg-white" />
        </FormField>
        <FormField
          id={`employment_history.${index}.end_date` as any}
          label="End Date"
          required={!watch(`employment_history.${index}.is_current` as any)}
          error={(errors.employment_history as any)?.[index]?.end_date}
        >
          <Input
            type="date"
            {...register(`employment_history.${index}.end_date` as any)}
            className="h-11 border-slate-200 bg-white"
            disabled={watch(`employment_history.${index}.is_current` as any)}
          />
        </FormField>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`current_${index}`}
          checked={watch(`employment_history.${index}.is_current` as any)}
          onCheckedChange={(v) => setValue(`employment_history.${index}.is_current` as any, !!v)}
        />
        <Label htmlFor={`current_${index}`} className="text-sm">I currently work here</Label>
      </div>
    </div>
  );
};

export const Step3Education: React.FC<Step3Props> = ({
  register,
  errors,
  watch,
  setValue,
  control,
  jobRolesLoading,
  jobRolesData,
  alternateRolesOptions,
  toast,
}) => {
  const selectedCountry = watch("zip_or_country");
  const otherCountry = watch("other_country");
  const countryLabel = selectedCountry === "Other"
    ? (otherCountry && otherCountry.trim() ? otherCountry.trim() : "")
    : (COUNTRY_OPTIONS.find(c => c.value === selectedCountry)?.label || selectedCountry || "");
  const displayCountryName = countryLabel || "";
  const jobRoles = Array.isArray(watch("job_role_preferences")) ? watch("job_role_preferences") : [];
  const locations = Array.isArray(watch("location_preferences")) ? watch("location_preferences") : [];
  const workPrefs = Array.isArray(watch("work_preferences")) ? watch("work_preferences") : [];
  const employmentStatus = watch("employment_status");
  const experience = watch("experience");
  const universityName = watch("university_name");
  const selectedCurrency = watch("salary_currency");

  // Set default currency when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryData = COUNTRY_DATA[selectedCountry as string];
      if (countryData) {
        setValue("salary_currency", countryData.currency, { shouldValidate: true });
      } else {
        setValue("salary_currency", "USD", { shouldValidate: true });
      }
    }
  }, [selectedCountry, setValue]);

  const currencySymbol = CURRENCY_OPTIONS.find(c => c.value === selectedCurrency)?.symbol || "$";

  const { fields, append, remove } = useFieldArray({
    control,
    name: "employment_history",
  });

  // Dynamic States
  const [uniSearch, setUniSearch] = useState("");
  const [uniSuggestions, setUniSuggestions] = useState<string[]>([]);
  const [uniLoading, setUniLoading] = useState(false);
  const [uniOpen, setUniOpen] = useState(false);

  const [locSearch, setLocSearch] = useState("");
  const [locSuggestions, setLocSuggestions] = useState<string[]>([]);
  const [locLoading, setLocLoading] = useState(false);

  const [compSearch, setCompSearch] = useState("");
  const [compSuggestions, setCompSuggestions] = useState<string[]>([]);
  const [compLoading, setCompLoading] = useState(false);

  useEffect(() => {
    if (uniSearch.length < 1) {
      setUniSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setUniLoading(true);
      const results = await fetchUniversities(uniSearch, selectedCountry);
      // Filter unique university names
      setUniSuggestions(Array.from(new Set(results)));
      setUniLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [uniSearch, selectedCountry]);

  useEffect(() => {
    if (locSearch.length < 4) {
      setLocSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLocLoading(true);
      const results = await fetchCities(locSearch, selectedCountry);
      // Filter unique location names
      setLocSuggestions(Array.from(new Set(results)));
      setLocLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [locSearch, selectedCountry]);

  useEffect(() => {
    if (compSearch.length < 1) {
      setCompSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCompLoading(true);
      const results = await fetchCompanies(compSearch);
      setCompSuggestions(Array.from(new Set(results)));
      setCompLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [compSearch]);

  // Default Work Preferences to All
  useEffect(() => {
    const current = watch("work_preferences");

    if (!current || current.length === 0) {
      setValue(
        "work_preferences",
        ["On-site", "Remote", "Hybrid"],
        { shouldValidate: true }
      );
    }
  }, [watch, setValue]);

  // Auto-append first job entry when experience > 0
  useEffect(() => {
    if (experience && experience !== "0" && fields.length === 0) {
      append({
        job_title: "",
        company_name: "",
        start_date: "",
        is_current: false,
      });
    }
  }, [experience, fields.length, append]);

  return (
    <div className="space-y-8">
      {/* Education Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <GraduationCap className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-800">Education Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="highest_education" label="Highest Level of Education" required error={errors.highest_education}>
          <Select
            value={watch("highest_education") || ""}
            onValueChange={(v) => setValue("highest_education", v, { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder="Select Education Level" />
            </SelectTrigger>
            <SelectContent>
              {["High School Diploma / GED", "Associate Degree", "Bachelor’s Degree", "Master’s Degree", "Doctorate / PhD", "Other"].map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="university_name" label={`University Name (${displayCountryName || "Selected Country"})`} required error={errors.university_name}>
          <Popover open={uniOpen} onOpenChange={setUniOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-11 border-slate-200 hover:bg-white font-normal text-left"
              >
                <span className="truncate">{universityName || "Search University..."}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Type university name..." value={uniSearch} onValueChange={setUniSearch} />
                <CommandEmpty>
                  {uniLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Searching...
                    </div>
                  ) : (
                    "No universities found."
                  )}
                </CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  <CommandItem onSelect={() => {
                    setValue("university_name", uniSearch, { shouldValidate: true });
                    setUniOpen(false);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Use "{uniSearch || "manual entry"}"
                  </CommandItem>
                  {uniSuggestions.map((uni) => (
                    <CommandItem
                      key={uni}
                      onSelect={() => {
                        setValue("university_name", uni, { shouldValidate: true });
                        setUniOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", universityName === uni ? "opacity-100" : "opacity-0")} />
                      {uni}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="main_subject" label="Major/ Minor" required error={errors.main_subject}>
          <Input
            {...register("main_subject")}
            placeholder="e.g., Computer Science"
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
          />
        </FormField>

        <FormField id="graduation_year" label="Year of Graduation" required error={errors.graduation_year}>
          <Select
            value={watch("graduation_year") || ""}
            onValueChange={(v) => setValue("graduation_year", v, { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="cgpa" label="Cumulative GPA / Percentage" required error={errors.cgpa}>
          <Input
            {...register("cgpa")}
            placeholder="e.g., 3.8 or 85%"
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      {/* Preferences Section */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mt-4">
        <Briefcase className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-800">Job Preferences</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="job_role_preferences" label="Preferred Job Role" required error={errors.job_role_preferences as any}>
          <Select
            disabled={jobRolesLoading}
            value={jobRoles && jobRoles.length > 0 ? jobRoles[0] : ""}
            onValueChange={(v) => {
              setValue("job_role_preferences", [v], { shouldValidate: true });
              if (v !== "Other") setValue("job_role_other", "", { shouldValidate: false });
            }}
          >
            <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0">
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
          {jobRoles.includes("Other") && (
            <div className="mt-2">
              <Input
                {...register("job_role_other")}
                placeholder="Enter other preferred job role"
                className={cn("h-11 border-slate-200 focus:border-blue-500 focus:ring-0", errors.job_role_other && "border-destructive focus:border-destructive")}
              />
              {errors.job_role_other && (
                <p className="text-xs font-medium text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                  {errors.job_role_other.message}
                </p>
              )}
            </div>
          )}
        </FormField>

        <div className="space-y-4">
          {alternateRolesOptions.length > 0 ? (
            <div className="space-y-2">
              <MultiSelect
                label={`Alternate Job Roles Based On Preferred Selected Job Roles`}
                options={alternateRolesOptions.map(role => ({ value: role, label: role }))}
                selected={alternateRolesOptions}
                onSelectionChange={() => { }} // Disabled
                disabled={true}
              />
            </div>
          ) : (
            <div className="space-y-1 p-3 bg-slate-50 rounded-md border border-slate-200">
              <p className="text-sm font-medium text-slate-700">Alternate Job Roles</p>
              <p className="text-xs text-muted-foreground italic">No alternate roles available for the selected job role.</p>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="desired_start_date" label={`Desired joining date if you got selected in any ${displayCountryName || "Country"} company`} required error={errors.desired_start_date}>
          <Input type="date" {...register("desired_start_date")} className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0" />
        </FormField>

        <FormField id="salary_currency" label="Preferred Currency" required error={errors.salary_currency}>
          <Select
            value={selectedCurrency || ""}
            onValueChange={(v) => setValue("salary_currency", v, { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map(curr => (
                <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="salary_expectations_yearly"
          label={`Salary Expectation (yearly)`}
          error={undefined}
        >
          <Select
            value={(watch("salary_expectations") || "").split(",").find(s => s.startsWith("Yearly:"))?.replace("Yearly:", "") || ""}
            onValueChange={(v) => {
              const current = (watch("salary_expectations") || "").split(",").filter(Boolean).filter(s => !s.startsWith("Yearly:"));
              setValue("salary_expectations", v ? [...current, `Yearly:${v}`].join(",") : current.join(","), { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white">
              <SelectValue placeholder={`In ${currencySymbol}`} />
            </SelectTrigger>
            <SelectContent>
              {(SALARY_RANGES[selectedCountry as string]?.Yearly || SALARY_RANGES["United States"].Yearly).map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label.replace(/[\$£€₹]|CA\$/g, currencySymbol)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="salary_expectations_hourly"
          label={`Salary Expectation (${COUNTRY_DATA[selectedCountry as string]?.salary_types[1] || "Hourly"})`}
          error={undefined}
        >
          <Select
            value={(watch("salary_expectations") || "").split(",").find(s => {
              const type = COUNTRY_DATA[selectedCountry as string]?.salary_types[1] || "Hourly";
              return s.startsWith(`${type}:`);
            })?.split(":")[1] || ""}
            onValueChange={(v) => {
              const type = COUNTRY_DATA[selectedCountry as string]?.salary_types[1] || "Hourly";
              const current = (watch("salary_expectations") || "").split(",").filter(Boolean).filter(s => !s.startsWith(`${type}:`));
              setValue("salary_expectations", v ? [...current, `${type}:${v}`].join(",") : current.join(","), { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white">
              <SelectValue placeholder={`In ${currencySymbol}`} />
            </SelectTrigger>
            <SelectContent>
              {(() => {
                const country = selectedCountry as string;
                const type = COUNTRY_DATA[country]?.salary_types[1] || "Hourly";
                const options = SALARY_RANGES[country]?.[type] || SALARY_RANGES["United States"].Hourly || [];
                return options.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label.replace(/[\$£€₹]|CA\$/g, currencySymbol)}</SelectItem>
                ));
              })()}
            </SelectContent>
          </Select>
        </FormField>
        {errors.salary_expectations && <p className="col-span-full text-sm text-destructive -mt-4">{errors.salary_expectations.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <MultiSelect
            label="Work Preferences *"
            options={["All", "On-site", "Remote", "Hybrid"].map(o => ({ label: o, value: o }))}
            selected={
              workPrefs.length === 3
                ? ["All", ...workPrefs]
                : workPrefs
            } onSelectionChange={(arr) => {
              if (arr.includes("All")) {
                setValue("work_preferences", ["On-site", "Remote", "Hybrid"], { shouldValidate: true });
              } else {
                setValue("work_preferences", arr.filter(v => v !== "All"), { shouldValidate: true });
              }
            }}
          />
          {errors.work_preferences && (
            <p className="text-sm text-destructive">{errors.work_preferences.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <MultiSelect
            label="Location Preferences *"
            placeholder={workPrefs.includes("Remote") ? "Search and select states/provinces..." : "Select 'Remote' to enable"}
            options={workPrefs.includes("Remote") ? Array.from(new Set([...locations, ...locSuggestions])).map(city => ({ label: city, value: city })) : []}
            selected={locations}
            onSelectionChange={(arr) => setValue("location_preferences", arr, { shouldValidate: true })}
            onSearchChange={workPrefs.includes("Remote") ? setLocSearch : undefined}
            error={errors.location_preferences?.message}
            disabled={!workPrefs.includes("Remote")}
          />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="experience" label="Experience (Years)" required error={errors.experience}>
          <Select
            value={watch("experience") || ""}
            onValueChange={(v) => setValue("experience", v, { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 border-slate-200">
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

        <FormField id="notice_period" label="Notice Period" required error={errors.notice_period}>
          <Select
            value={watch("notice_period") || ""}
            onValueChange={(v) => setValue("notice_period", v, { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 border-slate-200">
              <SelectValue placeholder="Select Notice Period" />
            </SelectTrigger>
            <SelectContent>
              {NOTICE_PERIOD_OPTIONS.map(o => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>


      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <YesNoField id="willing_to_relocate" label="Are you willing to relocate?" required watch={watch} setValue={setValue} />
        <YesNoField id="can_work_3_days_in_office" label="Can you work 3 days in office?" required watch={watch} setValue={setValue} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <YesNoField id="willing_to_travel" label="Willing to travel for business?" required watch={watch} setValue={setValue} />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Exclude Companies</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-11 border-slate-200 text-left font-normal">
              <div className="flex gap-1 overflow-hidden truncate">
                {(watch("exclude_companies") || []).length > 0 ? watch("exclude_companies")!.join(", ") : "NA"}
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search company to exclude..."
                value={compSearch}
                onValueChange={setCompSearch}
              />
              <CommandEmpty>
                {compLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </div>
                ) : (
                  "No companies found."
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {compSuggestions.map(comp => (
                  <CommandItem key={comp} onSelect={() => {
                    const current = (watch("exclude_companies") || []).filter(Boolean);
                    let next: string[];

                    if (current.includes(comp)) {
                      // Remove company
                      next = current.filter(c => c !== comp);
                    } else {
                      // Add company: remove NA if it exists
                      next = current.filter(c => c !== "NA");
                      next.push(comp);
                    }

                    // If empty, restore NA
                    if (next.length === 0) next = ["NA"];
                    setValue("exclude_companies", next, { shouldValidate: true });
                  }}>
                    <Check className={cn("mr-2 h-4 w-4", (watch("exclude_companies") || []).includes(comp) ? "opacity-100" : "opacity-0")} />
                    {comp}
                  </CommandItem>
                ))}
                <CommandItem onSelect={() => {
                  const val = prompt("Enter company name to exclude:");
                  if (val && val.trim()) {
                    const current = (watch("exclude_companies") || []).filter(Boolean);
                    // Remove NA if it exists
                    let next = current.filter(c => c !== "NA");
                    if (!next.includes(val.trim())) {
                      next.push(val.trim());
                    }
                    if (next.length === 0) next = ["NA"];
                    setValue("exclude_companies", next, { shouldValidate: true });
                  }
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Company
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-6">
        <FormField id="employment_status" label="Employment Status" required error={errors.employment_status}>
          <Select
            value={employmentStatus || ""}
            onValueChange={(v) => setValue("employment_status", v as any, { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 border-slate-200">
              <SelectValue placeholder="Select Employment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Employed">Employed</SelectItem>
              <SelectItem value="Unemployed">Unemployed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-800">Employment History</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
              onClick={() => append({ job_title: "", company_name: "", start_date: "", is_current: false })}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Job
            </Button>
          </div>
          {fields.map((field, index) => (
            <EmploymentHistoryRow
              key={field.id}
              index={index}
              register={register}
              watch={watch}
              setValue={setValue}
              remove={remove}
              selectedCountry={selectedCountry}
              jobRoleOptions={jobRoleOptions}
              jobRolesData={jobRolesData}
              alternateRolesOptions={alternateRolesOptions}
              errors={errors}
            />
          ))}

          {fields.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
              Click "Add Job" to enter your work experience.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
