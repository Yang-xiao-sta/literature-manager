import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({ title, description, action, children, className }: SectionCardProps) {
  return (
    <section className={cn("rounded-3xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}
