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
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { FormField } from "./FormField";
import { fetchAddressSuggestions, AddressSuggestion } from "../helpers";

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

const COUNTRY_MAP: Record<string, string> = {
  "us": "United States of America",
  "ca": "Canada",
  "gb": "United Kingdom",
  "ie": "Ireland"
};

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
  const visatype = watch("visatype");
  const fullAddress = watch("full_address");

  // Real-time Address States
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced Search Logic
  useEffect(() => {
    if (!addressValue || addressValue.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await fetchAddressSuggestions(addressValue);
      setSuggestions(results);
      setIsSearching(false);
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [addressValue]);

  // Phone input filter (only allows + and numbers)
  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    let value = input.value;

    // Remove any character that is not a + or a digit
    value = value.replace(/[^+0-9]/g, "");

    // Ensure it always starts with + and only has one +
    if (value.length === 0 || !value.startsWith("+")) {
      value = "+" + value.replace(/\+/g, "");
    } else {
      // Keep leading + and remove any subsequent ones
      value = "+" + value.slice(1).replace(/\+/g, "");
    }

    if (input.value !== value) {
      input.value = value;
      // Update form state directly to ensure validation triggers correctly
      setValue(input.name as any, value, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="first_name" label="First Name" required error={errors.first_name}>
          <Input
            id="first_name"
            {...register("first_name")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
        <FormField id="middle_name" label="Middle Name (Optional)" error={errors.middle_name}>
          <Input
            id="middle_name"
            {...register("middle_name")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      {/* Identity & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="last_name" label="Last Name" required error={errors.last_name}>
          <Input
            id="last_name"
            {...register("last_name")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
        <FormField id="personal_email" label="Email Address" required error={errors.personal_email}>
          <Input
            id="personal_email"
            type="email"
            {...register("personal_email")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      {/* Phone Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="primary_phone" label="Primary Phone (Job Applying Number)" required error={errors.primary_phone}>
          <div className="relative">
            <Input
              {...register("primary_phone")}
              onInput={handlePhoneInput}
              className="border-slate-300 focus:border-blue-500 focus:ring-0 pr-10"
              placeholder="+12025550123"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">+ only</span>
          </div>
        </FormField>
        <FormField id="callable_phone" label="Contact Number" required error={errors.callable_phone}>
          <div className="relative">
            <Input
              {...register("callable_phone")}
              onInput={handlePhoneInput}
              className="border-slate-300 focus:border-blue-500 focus:ring-0 pr-10"
              placeholder="+12025550456"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">+ only</span>
          </div>
        </FormField>
      </div>

      {/* WhatsApp & Visa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="whatsapp_number" label="WhatsApp Number" required error={errors.whatsapp_number}>
          <div className="relative">
            <Input
              {...register("whatsapp_number")}
              onInput={handlePhoneInput}
              className="border-slate-300 focus:border-blue-500 focus:ring-0 pr-10"
              placeholder="+12025550678"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">+ only</span>
          </div>
        </FormField>
        <FormField id="visatype" label="Visa Type" required error={errors.visatype}>
          <Select
            value={visatype || ""}
            onValueChange={(v) => setValue("visatype", v, { shouldValidate: true })}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder="Select Visa Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPT">OPT</SelectItem>
              <SelectItem value="CPT">CPT</SelectItem>
              <SelectItem value="H1B">H1B</SelectItem>
              <SelectItem value="H4EAD">H4 EAD</SelectItem>
              <SelectItem value="Green Card">Green Card</SelectItem>
              <SelectItem value="Citizen">Citizen</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {visatype === "Other" && (
            <div className="mt-2">
              <Input
                {...register("visatype_other")}
                placeholder="Enter other visa type"
                className="border-slate-300 focus:border-blue-500 focus:ring-0"
              />
            </div>
          )}
        </FormField>
      </div>

      {/* Address & Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="full_address" label="Full Address" required error={errors.full_address}>
          <Popover open={addressOpen} onOpenChange={setAddressOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={addressOpen}
                className="w-full justify-between border-slate-300 focus:border-blue-500 hover:bg-white font-normal text-left h-auto py-2 px-3 whitespace-normal"
              >
                <span className="truncate">{fullAddress || "Type to search address..."}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search address (minimum 3 characters)..."
                  value={addressValue}
                  onValueChange={(value) => {
                    setAddressValue(value);
                  }}
                />
                <CommandEmpty>
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="p-2 text-sm">
                      {addressValue.length < 3
                        ? "Please type at least 3 characters"
                        : "No matching addresses found. You can keep typing to enter manually."}
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {isSearching && suggestions.length === 0 && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    </div>
                  )}
                  {suggestions.map((suggestion, idx) => (
                    <CommandItem
                      key={`${suggestion.display_name}-${idx}`}
                      value={suggestion.display_name}
                      onSelect={() => {
                        const selectedAddress = suggestion.display_name;
                        const countryCode = suggestion.country_code;

                        // Update address
                        setValue("full_address", selectedAddress, { shouldValidate: true });
                        setAddressValue(selectedAddress);

                        // Auto-select Country
                        if (COUNTRY_MAP[countryCode]) {
                          setValue("zip_or_country", COUNTRY_MAP[countryCode], { shouldValidate: true });
                        }

                        setAddressOpen(false);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${fullAddress === suggestion.display_name ? "opacity-100" : "opacity-0"}`}
                      />
                      {suggestion.display_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </FormField>

        <FormField id="zip_or_country" label="Country (readonly)" required error={errors.zip_or_country}>
          <Select
            disabled={true}
            value={watch("zip_or_country") || ""}
            onValueChange={(v) => setValue("zip_or_country", v, { shouldValidate: true })}
          >
            <SelectTrigger className="border-slate-400 focus:border-blue-500 focus:ring-0">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States of America">United States of America</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Ireland">Ireland</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="France">France</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* Date of Birth & LinkedIn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="date_of_birth" label="Date of Birth" required error={errors.date_of_birth}>
          <Input
            id="date_of_birth"
            type="date"
            {...register("date_of_birth")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
        <FormField id="linkedin_url" label="LinkedIn (Optional)" error={errors.linkedin_url}>
          <Input
            placeholder="LinkedIn URL"
            {...register("linkedin_url")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      {/* Portfolio & GitHub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="portfolio_url" label="Portfolio (Optional)" error={errors.portfolio_url}>
          <Input
            placeholder="Portfolio URL"
            {...register("portfolio_url")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
        <FormField id="github_url" label="GitHub (Optional)" error={errors.github_url}>
          <Input
            placeholder="GitHub URL"
            {...register("github_url")}
            className="border-slate-300 focus:border-blue-500 focus:ring-0"
          />
        </FormField>
      </div>

      {/* Extra Notes */}
      <FormField id="addons_notes" label="Any Extra Information / Addons (Optional)" error={errors.addons_notes}>
        <Textarea
          {...register("addons_notes")}
          className="border-slate-300 focus:border-blue-500 focus:ring-0"
          placeholder="Provide any additional details you want us to know..."
        />
      </FormField>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileDropzone
          label="Resume/CV (PDF, DOC, DOCX, TXT, RTF) *"
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
