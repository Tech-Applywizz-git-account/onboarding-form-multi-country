import React from "react";
import { UseFormSetValue, UseFormWatch, UseFormRegister, FieldErrors } from "react-hook-form";
import { FormVals } from "../schema";
import { YesNoField } from "./YesNoField";
import { FormField } from "./FormField";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";

interface Step2Props {
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
  register: UseFormRegister<FormVals>;
  errors: FieldErrors<FormVals>;
}

export const Step2Eligibility: React.FC<Step2Props> = ({
  watch,
  setValue,
  register,
  errors,
}) => {
  const selectedCountry = watch("zip_or_country");
  const otherCountry = watch("other_country");
  const displayCountryName = selectedCountry === "Other"
    ? (otherCountry && otherCountry.trim() ? otherCountry.trim() : "the selected country")
    : (selectedCountry || "the country");
  const visatype = watch("visatype");
  const [sponsorshipTooltipOpen, setSponsorshipTooltipOpen] = React.useState(false);
  const isF1 = visatype?.startsWith("F1");

  const isHoveringRef = React.useRef(false);
  const tooltipTimeoutRef = React.useRef<any>(null);

  const handleRadioMouseEnter = () => {
    isHoveringRef.current = true;
    if (isF1) {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      setSponsorshipTooltipOpen(true);
    }
  };

  const handleRadioMouseLeave = () => {
    isHoveringRef.current = false;
    if (isF1) {
      setSponsorshipTooltipOpen(false);
    }
  };

  const handleRadioChange = () => {
    if (isF1) {
      setSponsorshipTooltipOpen(true);
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = setTimeout(() => {
        if (!isHoveringRef.current) {
          setSponsorshipTooltipOpen(false);
        }
      }, 3000);
    }
  };

  const prevVisaRef = React.useRef(visatype);
  const isUS = selectedCountry === "USA" || selectedCountry === "United States";

  React.useEffect(() => {
    if (isUS) {
      if (visatype === "H1B") {
        setValue("require_future_sponsorship", "yes", { shouldValidate: true });
      } else if (visatype?.startsWith("H4") || visatype === "GC" || visatype === "Citizen") {
        setValue("require_future_sponsorship", "no", { shouldValidate: true });
      } else if (visatype?.startsWith("F1")) {
        const currentSponsorship = watch("require_future_sponsorship");
        if (visatype !== prevVisaRef.current || !currentSponsorship) {
          setValue("require_future_sponsorship", "no", { shouldValidate: true });
        }
      }
    }
    prevVisaRef.current = visatype;
  }, [visatype, isUS, setValue, watch]);

  const isSponsorshipDisabled = isUS && (
    visatype === "H1B" ||
    visatype?.startsWith("H4") ||
    visatype === "GC" ||
    visatype === "Citizen"
  );

  return (
    <div className="space-y-6">
      <YesNoField 
        id="is_over_18" 
        label="Are you at least 18 years of age?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="eligible_to_work_in_us" 
        label={`Are you eligible to work in ${displayCountryName}?`} 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="authorized_without_visa" 
        label={`Are you legally authorized to work in ${displayCountryName} without a visa or sponsorship?`} 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="require_future_sponsorship" 
        label={
          <span className="flex items-center gap-1.5 flex-wrap">
            <span>{`Will you now or in the future require sponsorship for employment in ${displayCountryName}?`}</span>
            {isF1 && (
              <Tooltip open={sponsorshipTooltipOpen} onOpenChange={setSponsorshipTooltipOpen}>
                <TooltipTrigger asChild>
                  <button 
                    type="button"
                    onMouseEnter={() => setSponsorshipTooltipOpen(true)}
                    onMouseLeave={() => setSponsorshipTooltipOpen(false)}
                    onClick={() => setSponsorshipTooltipOpen(!sponsorshipTooltipOpen)}
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
                    <p>It is recommended to select "No" for this question if you are on an F1 visa (CPT/OPT/STEM OPT).</p>
                  </div>
                  <TooltipPrimitive.Arrow className="fill-slate-950" width={10} height={5} />
                </TooltipContent>
              </Tooltip>
            )}
          </span>
        } 
        required
        watch={watch} 
        setValue={setValue} 
        disabled={isSponsorshipDisabled}
        onRadioMouseEnter={handleRadioMouseEnter}
        onRadioMouseLeave={handleRadioMouseLeave}
        onRadioChange={handleRadioChange}
      />
      <YesNoField 
        id="can_perform_essential_functions" 
        label="Are you able to perform the essential functions of the job with or without reasonable accommodation?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="discharged_for_policy_violation" 
        label="Have you ever been discharged or forced to resign from any position for a violation of company policy?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
      <YesNoField 
        id="referred_by_agency" 
        label="Were you referred to us by a recruitment agency?" 
        required
        watch={watch} 
        setValue={setValue} 
      />
    </div>
  );
};
