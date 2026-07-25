import { getTranslations, setRequestLocale } from "next-intl/server";

import { AnimatedCounter } from "@/components/motion/animated-counter";
import BlurText from "@/components/motion/blur-text";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const COLOR_TOKENS = [
  "bg-background",
  "bg-surface",
  "bg-card",
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-danger",
  "bg-info",
  "bg-brand",
] as const;

type DesignPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DesignPage({ params }: DesignPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("design");

  return (
    <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-16 md:px-8">
      <header className="flex items-start justify-between gap-4">
        <div className="max-w-xl space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ThemeToggle />
      </header>

      <Stagger className="mt-16 space-y-16">
        <StaggerItem>
          <section className="space-y-4">
            <h2 className="text-xl font-medium">{t("colors")}</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
              {COLOR_TOKENS.map((token) => (
                <div key={token} className="space-y-1.5">
                  <div
                    className={`h-16 rounded-md border border-border ${token}`}
                  />
                  <p className="font-mono text-xs text-muted-foreground">
                    {token.replace("bg-", "")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </StaggerItem>

        <StaggerItem>
          <section className="space-y-4">
            <h2 className="text-xl font-medium">{t("typography")}</h2>
            <div className="space-y-3">
              <p className="text-5xl font-semibold tracking-tight">
                {t("typeSample")}
              </p>
              <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
                {t("bodySample")}
              </p>
            </div>
          </section>
        </StaggerItem>

        <StaggerItem>
          <section className="space-y-4">
            <h2 className="text-xl font-medium">{t("buttons")}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button>{t("primary")}</Button>
              <Button variant="secondary">{t("secondary")}</Button>
              <Button variant="outline">{t("outline")}</Button>
              <Button variant="ghost">{t("ghost")}</Button>
              <Button variant="destructive">{t("destructive")}</Button>
            </div>
          </section>
        </StaggerItem>

        <StaggerItem>
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-4">
              <h2 className="text-xl font-medium">{t("forms")}</h2>
              <div className="grid max-w-sm gap-2">
                <Label htmlFor="design-email">{t("emailLabel")}</Label>
                <Input
                  id="design-email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                />
                <p className="text-sm text-muted-foreground">
                  {t("emailHelper")}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-medium">{t("cards")}</h2>
              <Card className="max-w-sm">
                <CardHeader>
                  <CardTitle>{t("cardTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t("cardBody")}</p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Badge variant="secondary">
                    <AnimatedCounter value={1847} />
                  </Badge>
                  <Button size="sm" variant="outline">
                    {t("cardAction")}
                  </Button>
                </CardFooter>
              </Card>
            </section>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-4">
              <h2 className="text-xl font-medium">{t("feedback")}</h2>
              <Dialog>
                <DialogTrigger
                  render={
                    <Button variant="secondary">{t("openDialog")}</Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("dialogTitle")}</DialogTitle>
                    <DialogDescription>{t("dialogBody")}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose
                      render={<Button variant="ghost">{t("close")}</Button>}
                    />
                    <Button>{t("confirm")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-medium">{t("loadingStates")}</h2>
              <div className="max-w-sm space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </section>
          </div>
        </StaggerItem>

        <StaggerItem>
          <section className="space-y-4">
            <h2 className="text-xl font-medium">{t("motion")}</h2>
            <FadeIn>
              <div className="flex flex-wrap items-end gap-8 rounded-xl border border-border bg-surface p-8">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("counterLabel")}
                  </p>
                  <p className="font-mono text-4xl font-semibold">
                    <AnimatedCounter value={12480} />
                  </p>
                </div>
                <BlurText
                  text={t("blurSample")}
                  className="text-3xl font-semibold tracking-tight"
                />
              </div>
            </FadeIn>
          </section>
        </StaggerItem>
      </Stagger>
    </main>
  );
}
