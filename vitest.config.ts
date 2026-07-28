import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    // Bare names only match at the tree root, so a nested checkout was still
    // collected: git worktrees live under .claude/worktrees/, which made every
    // suite run twice and then fail on the copy whose deps are not installed.
    exclude: ["**/node_modules/**", "**/.next/**", "**/.claude/**"],
  },
});
