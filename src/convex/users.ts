import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, internalQuery, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { Scrypt } from "lucia";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return null;
    return user;
  },
});

export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[ąćęłńóśźż]/g, (char) => ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[char] ?? char))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeUsername(value?: string) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return undefined;
  const normalized = trimmed
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "");
  return normalized || undefined;
}

function validateUsername(username?: string) {
  if (!username) return;
  if (username.length < 3) {
    throw new Error("Nazwa użytkownika musi mieć co najmniej 3 znaki");
  }
  if (username.length > 32) {
    throw new Error("Nazwa użytkownika może mieć maksymalnie 32 znaki");
  }
  if (!/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/.test(username)) {
    throw new Error("Nazwa użytkownika może zawierać tylko małe litery, cyfry, kropki, myślniki i podkreślenia");
  }
}

async function ensureUsernameAvailable(ctx: QueryCtx | any, usernameLowercase?: string, excludeUserId?: Id<"users">) {
  if (!usernameLowercase) return;
  const existing = await ctx.db
    .query("users")
    .withIndex("usernameLowercase", (q: any) => q.eq("usernameLowercase", usernameLowercase))
    .first();
  if (existing && existing._id !== excludeUserId) {
    throw new Error("Ta nazwa użytkownika jest już zajęta");
  }
}

async function buildUniqueUsername(ctx: QueryCtx | any, rawBase?: string, excludeUserId?: Id<"users">) {
  const base = normalizeUsername(rawBase) || "uzytkownik";
  validateUsername(base);
  let candidate = base;
  let suffix = 1;
  while (true) {
    const existing = await ctx.db
      .query("users")
      .withIndex("usernameLowercase", (q: any) => q.eq("usernameLowercase", candidate))
      .first();
    if (!existing || existing._id === excludeUserId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

async function syncDisplayNameAcrossContent(ctx: QueryCtx | any, previousName: string, nextName: string) {
  if (!previousName || previousName === nextName) return;

  const articles = await ctx.db
    .query("articles")
    .withIndex("by_author", (q: any) => q.eq("author", previousName))
    .take(200);

  await Promise.all(articles.map((article: any) => ctx.db.patch(article._id, { author: nextName })));

  // Stories and updates: use indexed queries if available, otherwise limit
  const stories = await ctx.db.query("stories").order("desc").take(100);
  const updates = await ctx.db.query("updates").withIndex("by_publishedAt").order("desc").take(200);

  await Promise.all([
    ...stories
      .filter((item: any) => item.author === previousName)
      .map((item: any) => ctx.db.patch(item._id, { author: nextName })),
    ...updates
      .filter((item: any) => item.author === previousName)
      .map((item: any) => ctx.db.patch(item._id, { author: nextName })),
  ]);
}

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").take(100);
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.patch(args.id, { role: args.role });
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    slug: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("member")),
    image: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    status: v.optional(v.string()),
    description: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isLoveBydgoszczTeam: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    const { id, ...updates } = args;
    const existingUser = await ctx.db.get(id);
    if (!existingUser) throw new Error("User not found");

    const nextName = updates.name?.trim() || existingUser.name;
    const nextUsername = normalizeUsername(updates.username) ?? existingUser.username;
    const nextSlug = updates.slug?.trim() || (nextName ? slugify(nextName) : existingUser.slug);
    validateUsername(nextUsername);
    await ensureUsernameAvailable(ctx, nextUsername, id);

    await ctx.db.patch(id, {
      ...updates,
      name: nextName,
      username: nextUsername,
      usernameLowercase: nextUsername,
      slug: nextSlug,
    });

    if (existingUser.name && nextName && existingUser.name !== nextName) {
      await syncDisplayNameAcrossContent(ctx, existingUser.name, nextName);
    }
  },
});

export const create = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("member")),
    image: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    status: v.optional(v.string()),
    description: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isLoveBydgoszczTeam: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const email = args.email.trim().toLowerCase();
    if (!email) throw new Error("Email jest wymagany");

    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
    if (existingByEmail) {
      throw new Error("Konto z tym emailem już istnieje");
    }

    const username = normalizeUsername(args.username);
    validateUsername(username);
    await ensureUsernameAvailable(ctx, username);

    const password = args.password.trim();
    if (password.length < 8) {
      throw new Error("Hasło musi mieć co najmniej 8 znaków");
    }

    const name = normalizeOptionalString(args.name) || username || email.split("@")[0];

    return await ctx.db.insert("users", {
      name,
      username,
      usernameLowercase: username,
      slug: slugify(name),
      email,
      passwordHash: await new Scrypt().hash(password),
      passwordUpdatedAt: Date.now(),
      role: args.role,
      image: normalizeOptionalString(args.image),
      subtitle: normalizeOptionalString(args.subtitle),
      status: normalizeOptionalString(args.status),
      description: normalizeOptionalString(args.description),
      contactEmail: normalizeOptionalString(args.contactEmail),
      contactPhone: normalizeOptionalString(args.contactPhone),
      facebookUrl: normalizeOptionalString(args.facebookUrl),
      instagramUrl: normalizeOptionalString(args.instagramUrl),
      twitterUrl: normalizeOptionalString(args.twitterUrl),
      websiteUrl: normalizeOptionalString(args.websiteUrl),
      coverImage: normalizeOptionalString(args.coverImage),
      isLoveBydgoszczTeam: args.isLoveBydgoszczTeam ?? false,
      isAnonymous: false,
    });
  },
});

export const adminUpdateCredentials = mutation({
  args: {
    id: v.id("users"),
    username: v.string(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const existingUser = await ctx.db.get(args.id);
    if (!existingUser) throw new Error("User not found");

    const username = normalizeUsername(args.username);
    validateUsername(username);
    await ensureUsernameAvailable(ctx, username, args.id);

    const updates: Record<string, string | number | undefined> = {
      username,
      usernameLowercase: username,
    };

    const nextPassword = args.password?.trim();
    if (nextPassword) {
      if (nextPassword.length < 8) {
        throw new Error("Hasło musi mieć co najmniej 8 znaków");
      }
      updates.passwordHash = await new Scrypt().hash(nextPassword);
      updates.passwordUpdatedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);
    return await ctx.db.get(args.id);
  },
});

export const updateCurrentProfile = mutation({
  args: {
    name: v.string(),
    username: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    status: v.optional(v.string()),
    description: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    image: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existingUser = await ctx.db.get(userId);
    if (!existingUser) throw new Error("User not found");

    const nextName = args.name.trim();
    if (!nextName) throw new Error("Imie i nazwisko jest wymagane");

    const nextUsername = normalizeUsername(args.username);
    validateUsername(nextUsername);
    await ensureUsernameAvailable(ctx, nextUsername, userId);

    const nextSlug = slugify(nextName);

    await ctx.db.patch(userId, {
      name: nextName,
      username: nextUsername,
      usernameLowercase: nextUsername,
      slug: nextSlug,
      subtitle: normalizeOptionalString(args.subtitle),
      status: normalizeOptionalString(args.status),
      description: normalizeOptionalString(args.description),
      contactEmail: normalizeOptionalString(args.contactEmail),
      contactPhone: normalizeOptionalString(args.contactPhone),
      facebookUrl: normalizeOptionalString(args.facebookUrl),
      instagramUrl: normalizeOptionalString(args.instagramUrl),
      twitterUrl: normalizeOptionalString(args.twitterUrl),
      websiteUrl: normalizeOptionalString(args.websiteUrl),
      image: normalizeOptionalString(args.image),
      coverImage: normalizeOptionalString(args.coverImage),
    });

    if (existingUser.name && existingUser.name !== nextName) {
      await syncDisplayNameAcrossContent(ctx, existingUser.name, nextName);
    }

    return await ctx.db.get(userId);
  },
});

export const updateCurrentCredentials = mutation({
  args: {
    username: v.string(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existingUser = await ctx.db.get(userId);
    if (!existingUser) throw new Error("User not found");

    const nextUsername = normalizeUsername(args.username);
    validateUsername(nextUsername);
    await ensureUsernameAvailable(ctx, nextUsername, userId);

    const updates: Record<string, string | number | undefined> = {
      username: nextUsername,
      usernameLowercase: nextUsername,
    };

    if (args.password !== undefined) {
      const nextPassword = args.password.trim();
      if (nextPassword.length < 8) {
        throw new Error("Hasło musi mieć co najmniej 8 znaków");
      }
      updates.passwordHash = await new Scrypt().hash(nextPassword);
      updates.passwordUpdatedAt = Date.now();
    }

    await ctx.db.patch(userId, updates);
    return await ctx.db.get(userId);
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const getAuthUserByIdentifier = internalQuery({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const identifier = args.identifier.trim().toLowerCase();
    if (!identifier) return null;

    const user = identifier.includes("@")
      ? await ctx.db.query("users").withIndex("email", (q) => q.eq("email", identifier)).first()
      : await ctx.db.query("users").withIndex("usernameLowercase", (q) => q.eq("usernameLowercase", identifier)).first();

    if (!user) return null;

    return {
      _id: user._id,
      passwordHash: user.passwordHash,
    };
  },
});

export const getBySlugOrName = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const identifier = args.identifier.trim();
    const decoded = decodeURIComponent(identifier);
    const normalizedSlug = slugify(decoded);

    const bySlug = await ctx.db
      .query("users")
      .withIndex("slug", (q) => q.eq("slug", identifier))
      .first();
    if (bySlug) return bySlug;

    if (normalizedSlug && normalizedSlug !== identifier) {
      const byNormalizedSlug = await ctx.db
        .query("users")
        .withIndex("slug", (q) => q.eq("slug", normalizedSlug))
        .first();
      if (byNormalizedSlug) return byNormalizedSlug;
    }

    const byName = await ctx.db
      .query("users")
      .withIndex("name", (q) => q.eq("name", decoded))
      .first();
    if (byName) return byName;

    // Limit fallback scan to 100 users
    const allUsers = await ctx.db.query("users").take(100);
    const targetName = decoded.toLowerCase().replace(/-/g, " ");
    return allUsers.find((user) => {
      const userName = user.name?.toLowerCase();
      const userSlug = user.slug?.toLowerCase();
      const normalizedUserName = user.name ? slugify(user.name) : "";
      return (
        userName === targetName ||
        userSlug === identifier.toLowerCase() ||
        (!!normalizedSlug && normalizedUserName === normalizedSlug)
      );
    }) || null;
  },
});

export const getAuthors = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(100);
    return users.filter(u => u.name);
  }
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.storage.getUrl(args.storageId as Id<"_storage">);
  },
});

export const ensureCurrentUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const updates: Record<string, string | boolean> = {};
    const email = user.email?.trim().toLowerCase();
    const emailLocalPart = email?.split("@")[0]?.replace(/[._-]+/g, " ")?.trim();
    const generatedName = emailLocalPart
      ? emailLocalPart.replace(/\b\w/g, (char) => char.toUpperCase())
      : undefined;
    const generatedUsername = await buildUniqueUsername(
      ctx,
      user.username || user.slug || emailLocalPart || generatedName,
      userId,
    );

    if (!user.name && generatedName) {
      updates.name = generatedName;
    }

    const slugSource = user.slug ? undefined : user.name || generatedName || emailLocalPart;
    if (!user.slug && slugSource) {
      updates.slug = slugify(slugSource);
    }

    if (!user.username) {
      updates.username = generatedUsername;
      updates.usernameLowercase = generatedUsername;
    }

    if (!user.isAnonymous) {
      // Only check for admin if role is not yet set - avoid scanning all users every login
      if (user.role === undefined || user.role === "user") {
        const adminEmails = (process.env.ADMIN_EMAILS ?? "")
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean);

        if (email && adminEmails.includes(email)) {
          updates.role = "admin";
        } else if (user.role === undefined) {
          // Only check hasAdmin if role is completely unset (new user) - scan limited
          const allUsers = await ctx.db.query("users").take(50);
          const hasAdmin = allUsers.some((u) => u.role === "admin");
          if (!hasAdmin) {
            updates.role = "admin";
          } else {
            updates.role = "user";
          }
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }

    return await ctx.db.get(userId);
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});