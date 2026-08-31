import { describe, expect, it } from "vitest";
import { canEditDocument, canManageSharing } from "../src/lib/permissions";

describe("document permissions", () => {
  it("allows owners and editors to edit, while viewers remain read-only", () => {
    expect(canEditDocument("owner", "owner", "viewer")).toBe(true);
    expect(canEditDocument("owner", "editor", "editor")).toBe(true);
    expect(canEditDocument("owner", "viewer", "viewer")).toBe(false);
  });

  it("limits sharing management to the document owner", () => {
    expect(canManageSharing("owner", "owner")).toBe(true);
    expect(canManageSharing("owner", "editor")).toBe(false);
  });
});
