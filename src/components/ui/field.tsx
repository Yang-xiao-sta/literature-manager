import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, error, hint, required, children, className }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
