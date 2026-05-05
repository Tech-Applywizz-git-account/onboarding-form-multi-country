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
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, Loader2, CalendarIcon, Globe } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { FormField } from "./FormField";
import { fetchAddressSuggestions, AddressSuggestion } from "../helpers";
import { format, parse } from "date-fns";
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
}

import { COUNTRY_OPTIONS, PHONE_CODES, COUNTRY_DATA } from "../constants";

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
}: Step1Props) => {
  const selectedCountry = watch("zip_or_country");
  const dobValue = watch("date_of_birth");
  const fullAddress = watch("full_address");
  const visatype = watch("visatype");

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
      // Basic splitting logic (assume code is +X or +XX or +XXX)
      const match = fullPhone.match(/^(\+\d+)(\d+)$/);
      if (match) {
        setPrimaryPhoneCode(match[1]);
        setPrimaryPhoneNumber(match[2]);
      }
    }
  }, [watch("primary_phone")]);

  useEffect(() => {
    const fullPhone = watch("whatsapp_number") || "";
    if (fullPhone && !whatsappPhoneNumber) {
      const match = fullPhone.match(/^(\+\d+)(\d+)$/);
      if (match) {
        setWhatsappPhoneCode(match[1]);
        setWhatsappPhoneNumber(match[2]);
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

  const currentVisaOptions = selectedCountry ? COUNTRY_DATA[selectedCountry]?.visa_types || [] : [];

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
          label={`Date of Birth (${selectedCountry === "United States" ? "MM-DD-YYYY" : "DD-MM-YYYY"})`} 
          required 
          error={errors.date_of_birth}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-11 w-full justify-start text-left font-normal border-slate-200",
                  !dobValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dobValue ? format(new Date(dobValue), selectedCountry === "United States" ? "MM-dd-yyyy" : "dd-MM-yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dobValue ? new Date(dobValue) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setValue("date_of_birth", format(date, "yyyy-MM-dd"), { shouldValidate: true });
                  }
                }}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={1940}
                toYear={new Date().getFullYear()}
                classNames={{
                  caption_label: "hidden",
                  dropdown_month: "flex",
                  dropdown_year: "flex",
                  dropdown: "bg-white border-none shadow-none focus:ring-0",
                }}
              />
            </PopoverContent>
          </Popover>
        </FormField>
      </div>

      {/* Row 4: Primary Phone | WhatsApp Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="primary_phone" label="Primary Phone" required error={errors.primary_phone}>
          <div className="flex gap-0 h-11">
            <Select value={primaryPhoneCode} onValueChange={setPrimaryPhoneCode}>
              <SelectTrigger className="w-[100px] border-slate-200 border-r-0 rounded-r-none bg-slate-50 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHONE_CODES.map(pc => (
                  <SelectItem key={pc.value} value={pc.value}>{pc.value}</SelectItem>
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHONE_CODES.map(pc => (
                  <SelectItem key={pc.value} value={pc.value}>{pc.value}</SelectItem>
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
        <FormField id="full_address" label="Full Address" required error={errors.full_address}>
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

        <FormField id="visatype" label="Current Visa Type" required error={errors.visatype}>
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
              <SelectItem value="Other">Other</SelectItem>
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
        <FileDropzone
          label="Resume/CV *"
          onFileSelect={setResumeFile}
          initialFile={resumeFile}
          error={errors.resume_dummy?.message}
        />
        <FileDropzone
          label="Cover Letter (Optional)"
          onFileSelect={setCoverLetterFile}
          initialFile={coverLetterFile}
        />
      </div>
    </div>
  );
};
