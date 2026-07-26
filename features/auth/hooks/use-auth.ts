"use client";

import { use } from "react";

import { AuthContext } from "../components/auth-provider";
import type { AuthState } from "../types";

export function useAuth(): AuthState {
  return use(AuthContext);
}
