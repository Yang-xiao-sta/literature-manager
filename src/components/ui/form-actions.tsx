"use client";

import { LoaderCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = ButtonProps & {
  pending?: boolean;
  pendingLabel?: string;
};

export function SubmitButton({ children, pending, pendingLabel = "保存中...", disabled, ...props }: SubmitButtonProps) {
  return (
    <Button disabled={disabled || pending} {...props}>
      {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}
