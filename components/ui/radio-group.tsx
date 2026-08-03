"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { cn } from "@/lib/utils";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        // The `after` pseudo-element widens the hit area to ~40px without
        // changing the 16px visual — the control is too small to hit reliably
        // otherwise. Transition is scoped to the three properties that actually
        // change; `transition-all` here would also animate the focus ring's
        // width and make keyboard focus feel laggy.
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none transition-[background-color,border-color,box-shadow] duration-[var(--motion-instant)] ease-out after:absolute after:-inset-x-3 after:-inset-y-2 not-disabled:hover:border-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        {/* Grows from 60% rather than 0: a dot springing from nothing reads as
            a glitch at 8px, while a small scale-up reads as a press landing.
            `data-starting-style` is base-ui's mount hook — the indicator only
            exists while checked, so this is the one frame available. */}
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 scale-100 rounded-full bg-primary-foreground transition-transform duration-[var(--motion-instant)] ease-out data-starting-style:scale-60 motion-reduce:transition-none" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
