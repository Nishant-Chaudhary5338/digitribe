import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

export default function FormField({
  label,
  error,
  required,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-[#f0ede5]"
      >
        {label}
        {required && (
          <span aria-hidden className="text-[#ff5b3a] ml-0.5">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p role="alert" className="text-[#b91c1c] text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
