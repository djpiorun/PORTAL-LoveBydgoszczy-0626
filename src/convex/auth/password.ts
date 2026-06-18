import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import type { ConvexCredentialsConfig } from "@convex-dev/auth/server";
import type { DataModel } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { Scrypt } from "lucia";

function normalizeIdentifier(identifier: unknown) {
  return String(identifier || "").trim().toLowerCase();
}

export const passwordAuth: ConvexCredentialsConfig = ConvexCredentials<DataModel>({
  id: "username-password",
  authorize: async (params, ctx): Promise<{ userId: Id<"users"> } | null> => {
    const identifier = normalizeIdentifier(params.identifier);
    const password = String(params.password || "");
    const genericAuthError = "Nieprawidłowy login lub hasło";

    if (!identifier || !password) {
      throw new Error(genericAuthError);
    }

    const user: { _id: Id<"users">; passwordHash?: string } | null = await ctx.runQuery(internal.users.getAuthUserByIdentifier, {
      identifier,
    });

    if (!user?.passwordHash) {
      throw new Error(genericAuthError);
    }

    const valid = await new Scrypt().verify(user.passwordHash, password);
    if (!valid) {
      throw new Error(genericAuthError);
    }

    return { userId: user._id };
  },
});
