"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AuthError } from "@/features/auth/components/auth-error";
import { AuthField } from "@/features/auth/components/auth-field";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MEMBER_ROLES } from "@/types/domain";

import { useMembers } from "../hooks/use-members";
import { useOrganization } from "../hooks/use-organization";
import { inviteMember, removeMember } from "../services/organization-service";
import {
  inviteMemberSchema,
  type InviteMemberValues,
} from "../validation/organization-schemas";

const INVITABLE_ROLES = MEMBER_ROLES.filter((role) => role !== "owner");

export function TeamManager() {
  const t = useTranslations("organization");
  const { claims, user } = useAuth();
  const { organization } = useOrganization();
  const { members, loading, failed } = useMembers(claims?.organizationId);
  const [error, setError] = useState<string | undefined>();
  const [invited, setInvited] = useState(false);

  const isOwner = Boolean(user && organization?.ownerId === user.uid);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "staff", title: "" },
  });

  async function onInvite(values: InviteMemberValues) {
    if (!organization) return;
    setError(undefined);
    setInvited(false);
    const result = await inviteMember(organization.id, values);
    if (!result.ok) {
      setError(result.errorKey);
      return;
    }
    reset({ email: "", role: "staff", title: "" });
    setInvited(true);
  }

  async function handleRemove(memberId: string) {
    if (!organization) return;
    setError(undefined);
    const result = await removeMember(organization.id, memberId);
    if (!result.ok) {
      setError(result.errorKey);
    }
  }

  return (
    <div className="space-y-14">
      <section className="max-w-lg space-y-6">
        <h2 className="text-lg font-medium tracking-tight">
          {t("team.inviteHeading")}
        </h2>

        <form
          onSubmit={handleSubmit(onInvite)}
          className="space-y-5"
          noValidate
        >
          <AuthError message={error ? t(`errors.${error}`) : undefined} />

          <AuthField
            id="invite-email"
            type="email"
            label={t("team.emailLabel")}
            error={
              errors.email ? t(`errors.${errors.email.message}`) : undefined
            }
            {...register("email")}
          />

          <div className="grid gap-2">
            <Label htmlFor="invite-role">{t("team.roleLabel")}</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  items={INVITABLE_ROLES.map((role) => ({
                    value: role,
                    label: t(`roles.${role}`),
                  }))}
                  value={field.value ?? null}
                  onValueChange={(value) => field.onChange(value)}
                  name={field.name}
                >
                  <SelectTrigger id="invite-role" onBlur={field.onBlur}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVITABLE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {t(`roles.${role}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <AuthField
            id="invite-title"
            label={t("team.titleLabel")}
            placeholder={t("team.titlePlaceholder")}
            hint={t("team.titleHint")}
            error={
              errors.title ? t(`errors.${errors.title.message}`) : undefined
            }
            {...register("title")}
          />

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {t("team.invite")}
            </Button>
            {invited ? (
              <span className="text-sm text-success">{t("team.invited")}</span>
            ) : null}
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-medium tracking-tight">
          {t("team.membersHeading")}
        </h2>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : failed ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {t("team.failed")}
          </p>
        ) : members.length === 0 ? (
          <p className="text-muted-foreground">{t("team.empty")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-medium">
                    {member.displayName ?? member.email}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {member.title ?? member.email}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {member.status === "invited" ? (
                    <Badge variant="outline">{t("team.pending")}</Badge>
                  ) : null}
                  <Badge variant="secondary">{t(`roles.${member.role}`)}</Badge>
                  {member.role === "owner" || !isOwner ? null : (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleRemove(member.id)}
                    >
                      {t("team.remove")}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
