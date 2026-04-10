// src/pages/Onboarding/components/FormField.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  children,
  className = "",
  description,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-600 ml-0.5">*</span>}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="mt-1">
        {children}
      </div>
      {error && (
        <p className="text-xs font-medium text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
    </div>
  );
};
