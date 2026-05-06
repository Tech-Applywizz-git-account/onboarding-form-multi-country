import React, { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormVals } from "../schema";
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
  isParsing
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

  // Local state for phone parts
  const [primaryPhoneCode, setPrimaryPhoneCode] = useState("+1");
  const [primaryPhoneNumber, setPrimaryPhoneNumber] = useState("");
  const [whatsappPhoneCode, setWhatsappPhoneCode] = useState("+1");
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState("");

  // Real-time Address States
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync local phone parts with form value (handles external changes like prefill)
  useEffect(() => {
    const fullPhone = watch("primary_phone") || "";
    if (fullPhone && !primaryPhoneNumber) {
      // Try to match against known prefixes first
      const sortedCodes = [...PHONE_CODES].sort((a, b) => b.value.length - a.value.length);
      const codeMatch = sortedCodes.find(pc => fullPhone.startsWith(pc.value));
      
      if (codeMatch) {
        setPrimaryPhoneCode(codeMatch.value);
        setPrimaryPhoneNumber(fullPhone.slice(codeMatch.value.length));
      } else {
        // Fallback to regex if no known code matches
        const match = fullPhone.match(/^(\+\d{1,4})(\d+)$/);
        if (match) {
          setPrimaryPhoneCode(match[1]);
          setPrimaryPhoneNumber(match[2]);
        }
      }
    }
  }, [watch("primary_phone")]);

  useEffect(() => {
    const fullPhone = watch("whatsapp_number") || "";
    if (fullPhone && !whatsappPhoneNumber) {
      const sortedCodes = [...PHONE_CODES].sort((a, b) => b.value.length - a.value.length);
      const codeMatch = sortedCodes.find(pc => fullPhone.startsWith(pc.value));
      
      if (codeMatch) {
        setWhatsappPhoneCode(codeMatch.value);
        setWhatsappPhoneNumber(fullPhone.slice(codeMatch.value.length));
      } else {
        const match = fullPhone.match(/^(\+\d{1,4})(\d+)$/);
        if (match) {
          setWhatsappPhoneCode(match[1]);
          setWhatsappPhoneNumber(match[2]);
        }
      }
    }
  }, [watch("whatsapp_number")]);

  // Sync phone parts with form value (handles user input)
  useEffect(() => {
    if (primaryPhoneNumber) {
      setValue("primary_phone", `${primaryPhoneCode}${primaryPhoneNumber}`, { shouldValidate: true });
    }
  }, [primaryPhoneCode, primaryPhoneNumber, setValue]);

  useEffect(() => {
    if (whatsappPhoneNumber) {
      setValue("whatsapp_number", `${whatsappPhoneCode}${whatsappPhoneNumber}`, { shouldValidate: true });
    }
  }, [whatsappPhoneCode, whatsappPhoneNumber, setValue]);

  // Update phone codes and reset visa type when country changes
  useEffect(() => {
    if (selectedCountry) {
      const country = COUNTRY_OPTIONS.find(c => c.value === selectedCountry);
      if (country) {
        setPrimaryPhoneCode(country.phoneCode);
        setWhatsappPhoneCode(country.phoneCode);
      }
      
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

  const handlePhoneInput = (val: string, setter: (v: string) => void) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setter(cleaned);
  };

  const dynamicPhoneCodes = [...PHONE_CODES];
  if (selectedCountry === "Other") {
    const otherC = watch("other_country");
    const cObj = WORLD_COUNTRIES.find(c => c.name === otherC);
    if (cObj && !dynamicPhoneCodes.find(p => p.value === cObj.dial_code)) {
      dynamicPhoneCodes.push({ label: `${cObj.dial_code} (${cObj.name})`, value: cObj.dial_code });
    }
  }

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

      {/* Row 2: Last Name | Primary Country of Interest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="last_name" label="Last Name" required error={errors.last_name}>
          <Input
            id="last_name"
            {...register("last_name")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
            placeholder="Last Name"
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
                  const c = WORLD_COUNTRIES.find(wc => wc.name === v);
                  if (c) {
                    setPrimaryPhoneCode(c.dial_code);
                    setWhatsappPhoneCode(c.dial_code);
                  }
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

      {/* Row 3: Email Address | Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="personal_email" label="Email Address" required error={errors.personal_email}>
          <Input
            id="personal_email"
            type="email"
            {...register("personal_email")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
            placeholder="Email Address"
          />
        </FormField>
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
          <div className="flex gap-0 h-11">
            <Select value={primaryPhoneCode} onValueChange={setPrimaryPhoneCode}>
              <SelectTrigger className="w-[100px] border-slate-200 border-r-0 rounded-r-none bg-slate-50 focus:ring-0">
                <SelectValue>{primaryPhoneCode}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dynamicPhoneCodes.map(pc => (
                  <SelectItem key={pc.value} value={pc.value}>{pc.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={primaryPhoneNumber}
              onChange={(e) => handlePhoneInput(e.target.value, setPrimaryPhoneNumber)}
              className="flex-1 border-slate-200 rounded-l-none focus:border-blue-500 focus:ring-0"
              placeholder="Phone number"
            />
          </div>
        </FormField>
        <FormField id="whatsapp_number" label="WhatsApp Number" required error={errors.whatsapp_number}>
          <div className="flex gap-0 h-11">
            <Select value={whatsappPhoneCode} onValueChange={setWhatsappPhoneCode}>
              <SelectTrigger className="w-[100px] border-slate-200 border-r-0 rounded-r-none bg-slate-50 focus:ring-0">
                <SelectValue>{whatsappPhoneCode}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dynamicPhoneCodes.map(pc => (
                  <SelectItem key={pc.value} value={pc.value}>{pc.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={whatsappPhoneNumber}
              onChange={(e) => handlePhoneInput(e.target.value, setWhatsappPhoneNumber)}
              className="flex-1 border-slate-200 rounded-l-none focus:border-blue-500 focus:ring-0"
              placeholder="Phone number"
            />
          </div>
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
