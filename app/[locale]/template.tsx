import type { ReactNode } from "react";

import { PageTransition } from "@/components/motion/page-transition";

/**
 * Remounts on every navigation under /[locale], which is what replays the
 * route transition. Kept as a server component so the client boundary stays
 * inside PageTransition and page content is not forced into the client bundle.
 */
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
