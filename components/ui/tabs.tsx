"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * The indicator is a single element that travels between tabs rather than one
 * `::after` per trigger fading in and out. base-ui publishes the active tab's
 * geometry as `--active-tab-left` / `--active-tab-width` (and the vertical
 * equivalents), so the movement is a plain CSS transition on `translate` and
 * `width` — no layout animation library, and it stays correct when tabs are
 * added, removed, or reflowed.
 *
 * `width` is animated here in full knowledge of the usual rule against it: the
 * indicator is absolutely positioned with no children and no siblings in flow,
 * so there is nothing for it to reflow. Everything else in the app still
 * animates transform and opacity only.
 */
function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), "relative", className)}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        data-slot="tabs-indicator"
        className={cn(
          "absolute z-0 transition-[translate,width,height] duration-[var(--motion-base)] ease-out motion-reduce:transition-none",
          // `default` — the active pill itself travels. Previously each trigger
          // painted its own background, so the pill vanished from one tab and
          // reappeared on the next with no path between them.
          "group-data-[variant=default]/tabs-list:inset-y-[3px] group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:bg-background group-data-[variant=default]/tabs-list:shadow-sm dark:group-data-[variant=default]/tabs-list:bg-input/30",
          // `line` — a 2px rule under the active tab.
          "group-data-[variant=line]/tabs-list:bg-foreground group-data-[variant=line]/tabs-list:rounded-full",
          "group-data-horizontal/tabs:left-0 group-data-horizontal/tabs:w-[var(--active-tab-width)] group-data-horizontal/tabs:translate-x-[var(--active-tab-left)] group-data-[variant=line]/tabs-list:group-data-horizontal/tabs:bottom-0 group-data-[variant=line]/tabs-list:group-data-horizontal/tabs:h-0.5",
          "group-data-vertical/tabs:right-0 group-data-vertical/tabs:h-[var(--active-tab-height)] group-data-vertical/tabs:translate-y-[var(--active-tab-top)] group-data-[variant=line]/tabs-list:group-data-vertical/tabs:top-0 group-data-[variant=line]/tabs-list:group-data-vertical/tabs:w-0.5",
        )}
      />
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all duration-[var(--motion-fast)] group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        // The active background now belongs to the travelling indicator; the
        // trigger only changes its text colour.
        "data-active:text-foreground dark:data-active:text-foreground",
        "relative z-10",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
