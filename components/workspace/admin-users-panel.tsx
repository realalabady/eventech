"use client";

import { UserTable } from "@/features/admin/components/user-table";
import { useAdminUsers } from "@/features/admin/hooks/use-admin-users";
import { useAuth } from "@/features/auth/hooks/use-auth";

/**
 * Composition layer for admin user management: the admin feature stays unaware
 * of auth, so the current uid is resolved here and passed in (canonical §11).
 * It is needed so the table never offers an admin the button that would
 * suspend their own account — which the callable refuses anyway.
 */
export function AdminUsersPanel() {
  const { user } = useAuth();
  const { users, loading, failed } = useAdminUsers();

  return (
    <UserTable
      users={users}
      loading={loading}
      failed={failed}
      currentUserId={user?.uid ?? null}
    />
  );
}
