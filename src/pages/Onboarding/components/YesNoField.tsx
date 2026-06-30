import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormVals } from "../schema";
import { FormField } from "./FormField";
import { cn } from "@/lib/utils";

interface YesNoFieldProps {
  id: keyof FormVals;
  label: React.ReactNode;
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
  required?: boolean;
  disabled?: boolean;
  onRadioMouseEnter?: () => void;
  onRadioMouseLeave?: () => void;
  onRadioChange?: (v: string) => void;
}

export const YesNoField: React.FC<YesNoFieldProps> = ({
  id,
  label,
  watch,
  setValue,
  required = false,
  disabled = false,
  onRadioMouseEnter,
  onRadioMouseLeave,
  onRadioChange,
}) => {
  const value = watch(id) as string;

  return (
    <FormField id={id} label={label} required={required}>
      <RadioGroup
        value={value}
        disabled={disabled}
        onValueChange={(v) => {
          setValue(id, v as any, { shouldValidate: true });
          if (onRadioChange) onRadioChange(v);
        }}
        className="flex gap-6 mt-2"
      >
        <div 
          className="flex items-center space-x-2"
          onMouseEnter={onRadioMouseEnter}
          onMouseLeave={onRadioMouseLeave}
        >
          <RadioGroupItem value="yes" id={`${id}_yes`} disabled={disabled} />
          <Label htmlFor={`${id}_yes`} className={cn("font-normal", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>Yes</Label>
        </div>
        <div 
          className="flex items-center space-x-2"
          onMouseEnter={onRadioMouseEnter}
          onMouseLeave={onRadioMouseLeave}
        >
          <RadioGroupItem value="no" id={`${id}_no`} disabled={disabled} />
          <Label htmlFor={`${id}_no`} className={cn("font-normal", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>No</Label>
        </div>
      </RadioGroup>
    </FormField>
  );
};

