import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-control whitespace-nowrap transition-[transform,box-shadow,background-color,border-color,color] duration-[var(--motion-fast)] ease-out outline-none select-none not-disabled:hover:-translate-y-0.5 not-disabled:hover:scale-[1.02] not-disabled:hover:shadow-sm motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline not-disabled:hover:translate-y-0 not-disabled:hover:scale-100 not-disabled:hover:shadow-none",
      },
      size: {
        default:
          "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-8 gap-1 px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 text-[0.8rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-11",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * `loading` disables the button and swaps its icon slot for a spinner while
 * keeping the label in place — replacing the label would collapse the button's
 * width mid-interaction and shift everything beside it.
 *
 * `aria-busy` and a polite live region carry the state to screen readers; the
 * spinner itself is `aria-hidden` because a spinning icon announces nothing.
 * The label is required to stay visible for exactly that reason: it remains the
 * accessible name throughout.
 *
 * `loadingLabel` is optional and must already be translated by the caller —
 * this file is vendored and has no `useTranslations` of its own.
 */
function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  loadingLabel,
  disabled,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    loadingLabel?: string;
  }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : null}
      {children}
      {loading && loadingLabel ? (
        <span aria-live="polite" className="sr-only">
          {loadingLabel}
        </span>
      ) : null}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
