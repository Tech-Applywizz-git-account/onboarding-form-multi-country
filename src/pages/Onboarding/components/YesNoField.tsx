import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormVals } from "../schema";
import { FormField } from "./FormField";

interface YesNoFieldProps {
  id: keyof FormVals;
  label: string;
  watch: UseFormWatch<FormVals>;
  setValue: UseFormSetValue<FormVals>;
  required?: boolean;
}

export const YesNoField: React.FC<YesNoFieldProps> = ({
  id,
  label,
  watch,
  setValue,
  required = false,
}) => {
  const value = watch(id) as string;

  return (
    <FormField id={id} label={label} required={required}>
      <RadioGroup
        value={value}
        onValueChange={(v) => setValue(id, v as any, { shouldValidate: true })}
        className="flex gap-6 mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id={`${id}_yes`} />
          <Label htmlFor={`${id}_yes`} className="font-normal cursor-pointer">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id={`${id}_no`} />
          <Label htmlFor={`${id}_no`} className="font-normal cursor-pointer">No</Label>
        </div>
      </RadioGroup>
    </FormField>
  );
};
