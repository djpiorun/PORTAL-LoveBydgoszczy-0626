import { describe, expect, test } from "bun:test";
import {
  DYNAMIC_ROUTE_RESERVED_SLUGS,
  resolveRouteDecision,
} from "./DynamicRoute";

describe("DynamicRoute — routing decisions", () => {
  test("reserved system slugs never reach CMS", () => {
    expect(resolveRouteDecision("panel", true)).toBe("reserved");
    expect(resolveRouteDecision("admin", true)).toBe("reserved");
    expect(resolveRouteDecision("auth", true)).toBe("reserved");
    expect(resolveRouteDecision("logowanie", true)).toBe("reserved");
    expect(resolveRouteDecision("api", true)).toBe("reserved");
    expect(resolveRouteDecision("strona", true)).toBe("reserved");
    expect(resolveRouteDecision("dashboard", true)).toBe("reserved");
  });

  test("category slugs are handled as categories, not CMS", () => {
    expect(resolveRouteDecision("miasto", true)).toBe("category");
    expect(resolveRouteDecision("sport", true)).toBe("category");
    expect(resolveRouteDecision("medyczna", true)).toBe("category");
    expect(resolveRouteDecision("polityka", true)).toBe("category");
  });

  test("CMS slug is routed to CMS when page exists", () => {
    expect(resolveRouteDecision("polityka-prywatnosci", true)).toBe("cms");
    expect(resolveRouteDecision("o-nas", true)).toBe("cms");
    expect(resolveRouteDecision("regulamin", true)).toBe("cms");
  });

  test("unknown slug falls through to article when no CMS page", () => {
    expect(resolveRouteDecision("jakis-artykul-abc", false)).toBe("article");
    expect(resolveRouteDecision("polityka-prywatnosci", false)).toBe("article");
  });

  test("'strona' is reserved — /strona/:slug redirect cannot be a CMS page", () => {
    expect(DYNAMIC_ROUTE_RESERVED_SLUGS.has("strona")).toBe(true);
    expect(resolveRouteDecision("strona", true)).toBe("reserved");
  });

  test("case-insensitive slug matching for reserved slugs", () => {
    expect(resolveRouteDecision("Panel", true)).toBe("reserved");
    expect(resolveRouteDecision("ADMIN", true)).toBe("reserved");
  });
});
