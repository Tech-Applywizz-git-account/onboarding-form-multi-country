import React, { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control, Controller } from "react-hook-form";
import { FormVals } from "../schema";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,



} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2, Globe } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { FormField } from "./FormField";
import { fetchAddressSuggestions, AddressSuggestion } from "../helpers";
import { cn } from "@/lib/utils";

interface Step1Props {
  register: UseFormRegister<FormVals>;
  errors: FieldErrors<FormVals>;
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
  addressOpen: boolean;
  setAddressOpen: (open: boolean) => void;
  addressValue: string;
  setAddressValue: (value: string) => void;
  setResumeFile: (file: any) => void;
  setCoverLetterFile: (file: any) => void;
  resumeFile: any;
  coverLetterFile: any;
  isParsing?: boolean;
  control: Control<FormVals>;
}

import { COUNTRY_OPTIONS, PHONE_CODES, COUNTRY_DATA } from "../constants";
import { WORLD_COUNTRIES } from "../worldCountries";

export const Step1Personal = ({
  register,
  errors,
  watch,
  setValue,
  addressOpen,
  setAddressOpen,
  addressValue,
  setAddressValue,
  setResumeFile,
  setCoverLetterFile,
  resumeFile,
  coverLetterFile,
  isParsing,
  control
}: Step1Props) => {
  const selectedCountry = watch("zip_or_country");
  const dobValue = watch("date_of_birth");
  const fullAddress = watch("full_address");
  const otherCountry = watch("other_country");
  const visatype = watch("visatype");
  const currentVisaOptions = Array.from(new Set([
    ...(selectedCountry ? (COUNTRY_DATA[selectedCountry]?.visa_types || []) : []),
    "Other"
  ]));

  const isUS = selectedCountry === "USA" || selectedCountry === "United States";

  // When 'Other' is selected, use whatever the user has typed in the 'Specify Country' field.
  // Never fall back to showing the literal word "Other" in labels.
  const countryLabel = selectedCountry === "Other"
    ? (otherCountry && otherCountry.trim() ? otherCountry.trim() : "")
    : (COUNTRY_OPTIONS.find(c => c.value === selectedCountry)?.label || selectedCountry || "");
  const displayCountryName = countryLabel || "";

  // Real-time Address States
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Update visa type when country changes
  useEffect(() => {
    if (selectedCountry) {
      const currentVisa = watch("visatype");
      const validVisas = COUNTRY_DATA[selectedCountry]?.visa_types || [];
      if (currentVisa && !validVisas.includes(currentVisa)) {
        setValue("visatype", "", { shouldValidate: false });
      }
    }
  }, [selectedCountry, setValue]);

  // Debounced Search Logic
  useEffect(() => {
    if (!addressValue || addressValue.length < 3) {
      setSuggestions([]);
      return;
    }

    const countryObj = COUNTRY_OPTIONS.find(c => c.value === selectedCountry);
    const countryCode = countryObj?.code;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await fetchAddressSuggestions(addressValue, countryCode);
      setSuggestions(results);
      setIsSearching(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [addressValue, selectedCountry]);

  // Determine the default country code for PhoneInput
  const getSelectedCountryCode = () => {
    if (selectedCountry === "Other") {
      const otherC = watch("other_country");
      const cObj = WORLD_COUNTRIES.find(c => c.name === otherC);
      return cObj?.code?.toLowerCase() || 'us';
    }
    const country = COUNTRY_OPTIONS.find(c => c.value === selectedCountry);
    return country?.code?.toLowerCase() || 'us';
  };

  const selectedCountryCode = getSelectedCountryCode();

  const phoneInputStyles = {
    width: '100%',
    height: '44px',
    fontSize: '14px',
    paddingLeft: '48px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white'
  };

  const phoneButtonStyles = {
    borderRadius: '8px 0 0 8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '0 4px'
  };

  return (
    <div className="space-y-6">
      {/* Row 1: First Name | Middle Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="first_name" label="First Name" required error={errors.first_name}>
          <Input
            id="first_name"
            {...register("first_name")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
            placeholder="First Name"
          />
        </FormField>
        <FormField id="middle_name" label="Middle Name" error={errors.middle_name}>
          <Input
            id="middle_name"
            {...register("middle_name")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
            placeholder="Middle Name"
          />
        </FormField>
      </div>

      {/* Row 2: Last Name | Email Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="last_name" label="Last Name" required error={errors.last_name}>
          <Input
            id="last_name"
            {...register("last_name")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
            placeholder="Last Name"
          />
        </FormField>
        <FormField id="personal_email" label="Email Address" required error={errors.personal_email}>
          <Input
            id="personal_email"
            type="email"
            {...register("personal_email")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
            placeholder="Email Address"
          />
        </FormField>
      </div>

      {/* Row 3: Job Application Email | Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="company_email" label="Job Application email address (job marketing)" required error={errors.company_email}>
          <Input
            id="company_email"
            type="email"
            {...register("company_email")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
            placeholder="Job Application email address"
          />
        </FormField>
        <div className={`grid gap-6 ${selectedCountry === "Other" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          <FormField id="zip_or_country" label="Country" required error={errors.zip_or_country}>
            <Select
              value={selectedCountry || ""}
              onValueChange={(v) => setValue("zip_or_country", v, { shouldValidate: true })}
            >
              <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <SelectValue placeholder="Select Country" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {/* Render Other Country Dropdown if 'Other' is selected */}
          {selectedCountry === "Other" && (
            <FormField id="other_country" label="Specify Country" required error={errors.other_country}>
              <Select
                value={watch("other_country") || ""}
                onValueChange={(v) => {
                  setValue("other_country", v, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {WORLD_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        </div>
      </div>

      {/* Row 4: Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="date_of_birth"
          label={`Date of Birth (${selectedCountry === "United States" || selectedCountry === "USA" ? "MM-DD-YYYY" : "DD-MM-YYYY"})`}
          required
          error={errors.date_of_birth}
        >
          <Input
            id="date_of_birth"
            type="date"
            {...register("date_of_birth")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      {/* Row 4: Primary Phone | WhatsApp Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="primary_phone" label="Primary Phone" required error={errors.primary_phone}>
          <Controller
            name="primary_phone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                country={selectedCountryCode}
                value={value}
                onChange={(phone) => onChange(`+${phone}`)}
                enableSearch={true}
                placeholder="Enter primary phone number"
                inputStyle={phoneInputStyles}
                buttonStyle={phoneButtonStyles}
                containerClass="phone-input-container"
              />
            )}
          />
        </FormField>
        <FormField id="whatsapp_number" label="WhatsApp Number" required error={errors.whatsapp_number}>
          <Controller
            name="whatsapp_number"
            control={control}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                country={selectedCountryCode}
                value={value}
                onChange={(phone) => onChange(`+${phone}`)}
                enableSearch={true}
                placeholder="Enter WhatsApp number"
                inputStyle={phoneInputStyles}
                buttonStyle={phoneButtonStyles}
                containerClass="phone-input-container"
              />
            )}
          />
        </FormField>
      </div>

      {/* Row 5: Full Address | Current Visa Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="full_address" label={`${displayCountryName || "Current"} Address`} required error={errors.full_address}>
          <Popover open={addressOpen} onOpenChange={setAddressOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={!selectedCountry}
                className="w-full justify-between border-slate-200 focus:border-blue-500 hover:bg-white font-normal text-left h-11 px-3 whitespace-normal"
              >
                <span className="truncate">{fullAddress || (selectedCountry ? "Type to search address..." : "Select country first")}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search address..."
                  value={addressValue}
                  onValueChange={setAddressValue}
                />
                <CommandEmpty>
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4 text-xs">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Searching...
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-slate-500">
                      {addressValue.length < 3 ? "Type 3+ characters" : "No results found"}
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {suggestions.map((suggestion, idx) => (
                    <CommandItem
                      key={idx}
                      value={suggestion.display_name}
                      onSelect={() => {
                        setValue("full_address", suggestion.display_name, { shouldValidate: true });
                        setAddressValue(suggestion.display_name);
                        setAddressOpen(false);
                      }}
                      className="text-sm py-3"
                    >
                      <Check className={cn("mr-2 h-4 w-4", fullAddress === suggestion.display_name ? "opacity-100" : "opacity-0")} />
                      {suggestion.display_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </FormField>

        <FormField id="visatype" label={`Current ${displayCountryName || "Country"} Visa Type`} required error={errors.visatype}>
          <Select
            value={visatype || ""}
            disabled={!selectedCountry}
            onValueChange={(v) => setValue("visatype", v, { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder={selectedCountry ? "Select Visa Type" : "Select country first"} />
            </SelectTrigger>
            <SelectContent>
              {currentVisaOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {visatype === "Other" && (
            <div className="mt-2">
              <Input
                {...register("visatype_other")}
                placeholder="Enter other visa type"
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
              />
            </div>
          )}
        </FormField>
      </div>

      {/* Row 6: LinkedIn | Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="linkedin_url" label="LinkedIn (Optional)" error={errors.linkedin_url}>
          <Input
            placeholder="LinkedIn URL"
            {...register("linkedin_url")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
        <FormField id="portfolio_url" label="Portfolio (Optional)" error={errors.portfolio_url}>
          <Input
            placeholder="Portfolio URL"
            {...register("portfolio_url")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      {/* Row 7: GitHub | Additional Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="github_url" label="GitHub (Optional)" error={errors.github_url}>
          <Input
            placeholder="GitHub URL"
            {...register("github_url")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
        <FormField id="addons_notes" label="Additional Notes (Optional)" error={errors.addons_notes}>
          <Input
            placeholder="Anything else you'd like to share?"
            {...register("addons_notes")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      {/* Row 8: File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <FileDropzone
            label="Resume/CV *"
            onFileSelect={setResumeFile}
            initialFile={resumeFile}
            error={errors.resume_dummy?.message}
          />
          {isParsing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-xl z-10 animate-in fade-in duration-300">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
              <p className="text-xs font-semibold text-blue-700">AI is parsing your resume...</p>
            </div>
          )}
        </div>
        <FileDropzone
          label="Cover Letter (Optional)"
          onFileSelect={setCoverLetterFile}
          initialFile={coverLetterFile}
        />
      </div>
    </div>
  );
};
