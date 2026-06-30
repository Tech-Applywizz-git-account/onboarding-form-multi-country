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
import { Check, ChevronsUpDown, Loader2, Globe, Info, Calendar as CalendarIcon } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { FormField } from "./FormField";
import { fetchAddressSuggestions, AddressSuggestion, fetchPlaceDetails } from "../helpers";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

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
  const currentVisaOptions = selectedCountry ? (COUNTRY_DATA[selectedCountry]?.visa_types || []) : [];

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
  const [isManualAddress, setIsManualAddress] = useState(false);
  const [ignoreNextSearch, setIgnoreNextSearch] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);

  const primaryPhone = watch("primary_phone");
  const whatsappNumber = watch("whatsapp_number");

  const [isSameAsPhone, setIsSameAsPhone] = useState(() => {
    if (!whatsappNumber || whatsappNumber === "+" || whatsappNumber === "") {
      return true;
    }
    return primaryPhone === whatsappNumber;
  });

  // Job Email Tooltips and Personal Email Tooltips
  const [jobEmailTooltipOpen, setJobEmailTooltipOpen] = useState(false);
  const [personalEmailTooltipOpen, setPersonalEmailTooltipOpen] = useState(false);

  // Address fields watches and sync logic
  const addressLine1 = watch("address_line1");
  const addressLine2 = watch("address_line2");
  const city = watch("city");
  const stateProvince = watch("state_province");
  const zipPostalCode = watch("zip_postal_code");

  const countryVal = selectedCountry === "Other" ? otherCountry : selectedCountry;

  useEffect(() => {
    const combined = [
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      zipPostalCode,
      countryVal
    ]
      .filter(Boolean)
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .join(", ");
    setValue("full_address", combined, { shouldValidate: true });
  }, [addressLine1, addressLine2, city, stateProvince, zipPostalCode, countryVal, setValue]);

  useEffect(() => {
    if (isSameAsPhone && primaryPhone) {
      setValue("whatsapp_number", primaryPhone, { shouldValidate: true });
    }
  }, [primaryPhone, isSameAsPhone, setValue]);

  const handleSameAsPhoneChange = (checked: boolean) => {
    setIsSameAsPhone(checked);
    if (checked && primaryPhone) {
      setValue("whatsapp_number", primaryPhone, { shouldValidate: true });
    } else if (!checked) {
      setValue("whatsapp_number", "+", { shouldValidate: false });
    }
  };

  const enableManualAddress = () => {
    setIsManualAddress(true);
    if (addressValue && !fullAddress) {
      setValue("full_address", addressValue, { shouldValidate: true });
    }
  };

  const disableManualAddress = () => {
    setIsManualAddress(false);
    if (fullAddress) {
      setAddressValue(fullAddress);
    }
  };

  // Update visa type when country changes
  useEffect(() => {
    if (selectedCountry) {
      const currentVisa = watch("visatype");
      const validVisas = COUNTRY_DATA[selectedCountry]?.visa_types || [];
      
      const isVisaValid = validVisas.some(v => 
        currentVisa === v || 
        (v === "F1" && currentVisa?.startsWith("F1")) ||
        (v === "H4" && currentVisa?.startsWith("H4"))
      );

      if (currentVisa && !isVisaValid) {
        setValue("visatype", "", { shouldValidate: false });
      }
    }
  }, [selectedCountry, setValue]);

  // Debounced Search Logic
  useEffect(() => {
    if (ignoreNextSearch) {
      setIgnoreNextSearch(false);
      return;
    }

    if (!addressLine1 || addressLine1.length < 3) {
      setSuggestions([]);
      return;
    }

    const countryObj = COUNTRY_OPTIONS.find(c => c.value === selectedCountry);
    const countryCode = countryObj?.code;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await fetchAddressSuggestions(addressLine1, countryCode);
      setSuggestions(results);
      setIsSearching(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [addressLine1, selectedCountry]);

  const handleSelectSuggestion = async (sug: AddressSuggestion) => {
    setIgnoreNextSearch(true);

    let finalSug = sug;
    if (sug.place_id) {
      const details = await fetchPlaceDetails(sug.place_id);
      if (details) {
        finalSug = {
          ...sug,
          ...details,
        };
      }
    }

    setValue("address_line1", finalSug.address_line1, { shouldValidate: true });
    setValue("address_line2", finalSug.address_line2, { shouldValidate: true });
    setValue("city", finalSug.city, { shouldValidate: true });
    setValue("state_province", finalSug.state, { shouldValidate: true });
    setValue("zip_postal_code", finalSug.zip, { shouldValidate: true });

    // Handle country selection matching
    const nominatimCountry = finalSug.country || "";
    const matched = COUNTRY_OPTIONS.find(c =>
      c.value.toLowerCase() === nominatimCountry.toLowerCase() ||
      c.label.toLowerCase() === nominatimCountry.toLowerCase()
    );

    if (matched) {
      setValue("zip_or_country", matched.value, { shouldValidate: true });
    } else if (nominatimCountry) {
      setValue("zip_or_country", "Other", { shouldValidate: true });
      setValue("other_country", nominatimCountry, { shouldValidate: true });
    }

    setSuggestions([]);
    setAddressFocused(false);
  };

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
        <FormField 
          id="personal_email" 
          label={
            <span className="flex items-center gap-1.5">
              <span>Email Address</span>
              <Tooltip open={personalEmailTooltipOpen} onOpenChange={setPersonalEmailTooltipOpen}>
                <TooltipTrigger asChild>
                  <button 
                    type="button"
                    onMouseEnter={() => setPersonalEmailTooltipOpen(true)}
                    onMouseLeave={() => setPersonalEmailTooltipOpen(false)}
                    onClick={() => setPersonalEmailTooltipOpen(!personalEmailTooltipOpen)}
                    className="flex items-center justify-center bg-slate-950 text-white rounded-full w-4 h-4 shadow-sm hover:bg-[#1F4096] hover:scale-105 active:scale-95 transition-all duration-200 cursor-help outline-none border border-slate-800"
                  >
                    <span className="text-[9px] font-extrabold leading-none font-sans relative -top-[0.5px]">i</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  align="center" 
                  className="bg-slate-950 text-slate-100 border border-slate-800 p-3 max-w-[280px] shadow-2xl rounded-lg text-xs leading-relaxed z-[100]"
                  sideOffset={6}
                >
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-[#00D2C4] mt-0.5 flex-shrink-0" />
                    <p>Enter your primary personal email address where we can reach you directly for all updates.</p>
                  </div>
                  <TooltipPrimitive.Arrow className="fill-slate-950" width={10} height={5} />
                </TooltipContent>
              </Tooltip>
            </span>
          }
          required 
          error={errors.personal_email}
        >
          <Input
            id="personal_email"
            type="email"
            {...register("personal_email")}
            onFocus={() => setPersonalEmailTooltipOpen(true)}
            onBlur={() => setPersonalEmailTooltipOpen(false)}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
            placeholder="Email Address"
          />
        </FormField>
      </div>

      {/* Row 3: Job Application Email | Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          id="company_email" 
          label={
            <span className="flex items-center gap-1.5">
              <span>Job Application Email</span>
              <Tooltip open={jobEmailTooltipOpen} onOpenChange={setJobEmailTooltipOpen}>
                <TooltipTrigger asChild>
                  <button 
                    type="button"
                    onMouseEnter={() => setJobEmailTooltipOpen(true)}
                    onMouseLeave={() => setJobEmailTooltipOpen(false)}
                    onClick={() => setJobEmailTooltipOpen(!jobEmailTooltipOpen)}
                    className="flex items-center justify-center bg-slate-950 text-white rounded-full w-4 h-4 shadow-sm hover:bg-[#1F4096] hover:scale-105 active:scale-95 transition-all duration-200 cursor-help outline-none border border-slate-800"
                  >
                    <span className="text-[9px] font-extrabold leading-none font-sans relative -top-[0.5px]">i</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  align="center" 
                  className="bg-slate-950 text-slate-100 border border-slate-800 p-3 max-w-[280px] shadow-2xl rounded-lg text-xs leading-relaxed z-[100]"
                  sideOffset={6}
                >
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-[#00D2C4] mt-0.5 flex-shrink-0" />
                    <p>Enter the email address where you want to receive job application updates and marketing emails.</p>
                  </div>
                  <TooltipPrimitive.Arrow className="fill-slate-950" width={10} height={5} />
                </TooltipContent>
              </Tooltip>
            </span>
          }
          required 
          error={errors.company_email}
        >
          <Input
            id="company_email"
            type="email"
            {...register("company_email")}
            onFocus={() => setJobEmailTooltipOpen(true)}
            onBlur={() => setJobEmailTooltipOpen(false)}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0"
            placeholder="Job Application Email"
          />
        </FormField>

        <FormField
          id="date_of_birth"
          label="Date of Birth (MM/DD/YYYY)"
          required
          error={errors.date_of_birth}
        >
          <Controller
            name="date_of_birth"
            control={control}
            render={({ field: { onChange, value } }) => {
              const getParsedDate = (val: string) => {
                if (!val) return undefined;
                const parts = val.split("/");
                if (parts.length !== 3) return undefined;
                const month = parseInt(parts[0], 10);
                const day = parseInt(parts[1], 10);
                let year = parseInt(parts[2], 10);
                if (isNaN(month) || isNaN(day) || isNaN(year)) return undefined;
                
                const currentYear = new Date().getFullYear();
                const currentCentury = Math.floor(currentYear / 100) * 100;
                const twoDigitCutoff = currentYear % 100;
                
                if (year < 100) {
                  if (year <= twoDigitCutoff) {
                    year += currentCentury;
                  } else {
                    year += (currentCentury - 100);
                  }
                }
                return new Date(year, month - 1, day);
              };

              const selectedDate = getParsedDate(value);

              const handleInputChange = (val: string) => {
                // Strip non-digits and limit to 8 digits
                const digits = val.replace(/\D/g, "").slice(0, 8);
                let formatted = digits;
                if (digits.length > 2) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                }
                if (digits.length > 4) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
                }
                onChange(formatted);
              };

              return (
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={value || ""}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full h-11 pr-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-slate-600 focus:ring-0"
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            onChange(format(date, "MM/dd/yyyy"));
                          } else {
                            onChange("");
                          }
                        }}
                        captionLayout="dropdown-buttons"
                        fromYear={1930}
                        toYear={new Date().getFullYear()}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              );
            }}
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

        <FormField id="whatsapp_number" label="WhatsApp Number" required={!isSameAsPhone} error={errors.whatsapp_number}>
          {primaryPhone && primaryPhone.length > 2 && primaryPhone !== "+" ? (
            <div>
              {isSameAsPhone ? (
                <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-200 flex items-center justify-between h-11">
                  <span className="text-xs font-medium text-slate-600 truncate max-w-[60%]">
                    Same as Phone: {primaryPhone}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => handleSameAsPhoneChange(false)}
                  >
                    WhatsApp is different
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
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
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-xs text-blue-600 hover:text-blue-700 h-auto p-0 font-medium"
                      onClick={() => handleSameAsPhoneChange(true)}
                    >
                      Same as Primary Phone
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200 flex items-center h-11 text-slate-400 italic text-xs">
              Enter Primary Phone first
            </div>
          )}
        </FormField>
      </div>

      {/* Address Details Section */}
      <div className="space-y-6 bg-slate-50/40 p-4 rounded-xl border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 border-b pb-2 flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-blue-500" />
          <span>Address Details</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <FormField id="address_line1" label="Address Line 1" required error={errors.address_line1}>
              <div className="relative">
                <Input
                  id="address_line1"
                  {...register("address_line1")}
                  onFocus={() => setAddressFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setAddressFocused(false), 200);
                  }}
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white w-full"
                  placeholder="Street address, P.O. box, company name"
                  autoComplete="off"
                />

                {addressFocused && (isSearching || suggestions.length > 0) && (
                  <div className="absolute left-0 right-0 z-[100] mt-1 max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                    {isSearching ? (
                      <div className="flex items-center justify-center p-3 text-xs text-slate-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                        <span>Searching addresses...</span>
                      </div>
                    ) : (
                      suggestions.map((sug, idx) => (
                        <div
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(sug);
                          }}
                          className="px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          {sug.display_name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </FormField>
          </div>

          <div className="col-span-1 md:col-span-2">
            <FormField id="address_line2" label="Address Line 2 (Optional)" error={errors.address_line2}>
              <Input
                id="address_line2"
                {...register("address_line2")}
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </FormField>
          </div>

          <FormField id="city" label="City" required error={errors.city}>
            <Input
              id="city"
              {...register("city")}
              className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
              placeholder="City"
            />
          </FormField>

          <FormField id="state_province" label="State / Province" required error={errors.state_province}>
            <Input
              id="state_province"
              {...register("state_province")}
              className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
              placeholder="State / Province / Region"
            />
          </FormField>

          <FormField id="zip_postal_code" label="Zip / Postal Code" required error={errors.zip_postal_code}>
            <Input
              id="zip_postal_code"
              {...register("zip_postal_code")}
              className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
              placeholder="Zip / Postal Code"
            />
          </FormField>

          <FormField id="zip_or_country" label="Country" required error={errors.zip_or_country}>
            <div className="space-y-2">
              <Select
                value={selectedCountry || ""}
                onValueChange={(v) => setValue("zip_or_country", v, { shouldValidate: true })}
              >
                <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white">
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
              
              {selectedCountry === "Other" && (
                <div className="mt-2 animate-in fade-in duration-200">
                  <Select
                    value={watch("other_country") || ""}
                    onValueChange={(v) => {
                      setValue("other_country", v, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORLD_COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </FormField>
        </div>
      </div>

      {/* Row 9: Visa Type | LinkedIn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="visatype" label={`Current ${displayCountryName || "Country"} Visa Type`} required error={errors.visatype}>
          {isUS ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!selectedCountry}>
                <Button
                  variant="outline"
                  className="w-full justify-between border-slate-200 focus:border-blue-500 hover:bg-white font-normal text-left h-11 px-3 whitespace-normal"
                >
                  <span className="truncate">{visatype || "Select Visa Type"}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-md p-1 z-50">
                {COUNTRY_DATA["United States"].visa_types.map((opt) => {
                  if (opt === "F1") {
                    return (
                      <DropdownMenuSub key={opt}>
                        <DropdownMenuSubTrigger className="cursor-pointer hover:bg-slate-50 flex items-center justify-between px-2 py-2 text-sm text-slate-700 rounded-md focus:bg-slate-50 data-[state=open]:bg-slate-50">
                          <span>F1</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-white border border-slate-200 rounded-md shadow-md p-1 min-w-[10rem] z-[60]">
                          <DropdownMenuItem
                            onSelect={() => setValue("visatype", "F1 CPT", { shouldValidate: true })}
                            className="cursor-pointer hover:bg-slate-50 px-2 py-2 text-sm text-slate-700 rounded-md focus:bg-slate-50"
                          >
                            F1 CPT
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setValue("visatype", "F1 OPT", { shouldValidate: true })}
                            className="cursor-pointer hover:bg-slate-50 px-2 py-2 text-sm text-slate-700 rounded-md focus:bg-slate-50"
                          >
                            F1 OPT
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setValue("visatype", "F1 STEM OPT", { shouldValidate: true })}
                            className="cursor-pointer hover:bg-slate-50 px-2 py-2 text-sm text-slate-700 rounded-md focus:bg-slate-50"
                          >
                            F1 STEM OPT
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  }

                  if (opt === "H4") {
                    return (
                      <DropdownMenuSub key={opt}>
                        <DropdownMenuSubTrigger className="cursor-pointer hover:bg-slate-50 flex items-center justify-between px-2 py-2 text-sm text-slate-700 rounded-md focus:bg-slate-50 data-[state=open]:bg-slate-50">
                          <span>H4</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-white border border-slate-200 rounded-md shadow-md p-1 min-w-[10rem] z-[60]">
                          <DropdownMenuItem
                            onSelect={() => setValue("visatype", "H4 (No EAD)", { shouldValidate: true })}
                            className="cursor-pointer hover:bg-slate-50 px-2 py-2 text-sm text-slate-700 rounded-md focus:bg-slate-50"
                          >
                            H4 (No EAD)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setValue("visatype", "H4 EAD", { shouldValidate: true })}
                            className="cursor-pointer hover:bg-slate-50 px-2 py-2 text-sm text-slate-700 rounded-md focus:bg-slate-50"
                          >
                            H4 EAD
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  }

                  return (
                    <DropdownMenuItem
                      key={opt}
                      onSelect={() => setValue("visatype", opt, { shouldValidate: true })}
                      className="cursor-pointer hover:bg-slate-50 px-2 py-2 text-sm text-slate-700 rounded-md focus:bg-slate-50"
                    >
                      {opt}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Select
              value={visatype || ""}
              disabled={!selectedCountry}
              onValueChange={(v) => setValue("visatype", v, { shouldValidate: true })}
            >
              <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white">
                <SelectValue placeholder={selectedCountry ? "Select Visa Type" : "Select country first"} />
              </SelectTrigger>
              <SelectContent>
                {currentVisaOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {visatype === "Other" && (
            <div className="mt-2">
              <Input
                {...register("visatype_other")}
                placeholder="Enter other visa type"
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
              />
            </div>
          )}
        </FormField>

        <FormField id="linkedin_url" label="LinkedIn (Optional)" error={errors.linkedin_url}>
          <Input
            placeholder="LinkedIn URL"
            {...register("linkedin_url")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
          />
        </FormField>
      </div>

      {/* Row 10: GitHub | Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField id="github_url" label="GitHub (Optional)" error={errors.github_url}>
          <Input
            placeholder="GitHub URL"
            {...register("github_url")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
          />
        </FormField>
        <FormField id="portfolio_url" label="Portfolio (Optional)" error={errors.portfolio_url}>
          <Input
            placeholder="Portfolio URL"
            {...register("portfolio_url")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
          />
        </FormField>
      </div>

      {/* Row 11: Additional Notes */}
      <div className="grid grid-cols-1 gap-6">
        <FormField id="addons_notes" label="Additional Notes (Optional)" error={errors.addons_notes}>
          <Input
            placeholder="Anything else you'd like to share?"
            {...register("addons_notes")}
            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white"
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
