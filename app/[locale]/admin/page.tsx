import { redirect } from "@/i18n/navigation";

/**
 * `/admin` had no page of its own — only a layout and six section folders — so
 * the console's own root 404'd and anything linking to it had to guess a
 * section. User management is the landing section in guide 43's IA, and the
 * layout's `RequireAdmin` still gates whatever this lands on.
 */
export default async function AdminIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/admin/users", locale });
}
