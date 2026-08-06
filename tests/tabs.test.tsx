import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/**
 * Guards the sliding tabs indicator added in TASK_04.
 *
 * That change put a `Tabs.Indicator` inside `Tabs.List` and moved the active
 * background off the individual triggers. Browser testing showed the ticket
 * wallet's tabs not switching, and it was unclear whether the indicator caused
 * it. These tests answer that without a browser, a signed-in session, or seeded
 * Firestore data — all of which the manual attempt needed.
 */
function Fixture() {
  return (
    <Tabs defaultValue="upcoming">
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="used">Used</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">upcoming panel</TabsContent>
      <TabsContent value="used">used panel</TabsContent>
      <TabsContent value="past">past panel</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  // vitest.config.ts does not set `globals: true`, so Testing Library cannot
  // register its own afterEach — without this every render stays in the
  // document and `screen` queries match across tests.
  afterEach(cleanup);

  it("renders the default tab as selected", () => {
    render(<Fixture />);
    expect(screen.getByRole("tab", { name: "Upcoming" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("upcoming panel")).toBeInTheDocument();
  });

  it("switches panels when a tab is clicked", async () => {
    const user = userEvent.setup();
    render(<Fixture />);

    await user.click(screen.getByRole("tab", { name: "Used" }));

    expect(screen.getByRole("tab", { name: "Used" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Upcoming" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByText("used panel")).toBeInTheDocument();
  });

  it("uses manual activation: arrow moves focus, Enter selects", async () => {
    const user = userEvent.setup();
    render(<Fixture />);

    await user.tab();
    await user.keyboard("{ArrowRight}");

    // base-ui implements MANUAL activation, which is the accessible default:
    // arrowing moves focus without changing the panel, so a keyboard user can
    // traverse the tablist without firing whatever each tab loads.
    expect(screen.getByRole("tab", { name: "Used" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Upcoming" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.keyboard("{Enter}");

    expect(screen.getByRole("tab", { name: "Used" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("still renders the indicator alongside the triggers", () => {
    // The indicator must not replace or displace the tabs — the bug being
    // guarded against is it interfering with the list's own children.
    const { container } = render(<Fixture />);
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(
      container.querySelector('[data-slot="tabs-indicator"]'),
    ).toBeInTheDocument();
  });
});
