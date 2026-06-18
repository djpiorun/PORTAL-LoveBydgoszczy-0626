"use node";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "asset";
}

function getExtension(fileName: string, contentType: string) {
  const nameMatch = fileName.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (nameMatch) return nameMatch;
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/png") return "png";
  if (contentType === "image/gif") return "gif";
  if (contentType === "image/svg+xml") return "svg";
  if (contentType.startsWith("video/")) return contentType.split("/")[1] || "mp4";
  return "jpg";
}

export const createUploadUrl = action({
  args: {
    fileName: v.string(),
    contentType: v.string(),
    folder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Auth guard: only admin or member can upload
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.runQuery(api.users.currentUser, {}) as any;
    if (!user || (user.role !== "admin" && user.role !== "member")) {
      throw new Error("Unauthorized");
    }

    const settings = await ctx.runQuery(api.settings.get, {}) as any;

    if (
      !settings?.r2Enabled ||
      !settings?.r2AccountId ||
      !settings?.r2AccessKeyId ||
      !settings?.r2SecretAccessKey ||
      !settings?.r2BucketName ||
      !settings?.r2PublicBaseUrl
    ) {
      throw new Error("R2 is not configured");
    }

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${settings.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: settings.r2AccessKeyId,
        secretAccessKey: settings.r2SecretAccessKey,
      },
    });

    const now = new Date();
    const folder = (args.folder || "uploads").replace(/^\/+|\/+$/g, "");
    const extension = getExtension(args.fileName, args.contentType);
    const key = [
      folder,
      `${now.getUTCFullYear()}`,
      `${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
      `${Date.now()}-${sanitizeFileName(args.fileName)}.${extension}`,
    ].join("/");

    const command = new PutObjectCommand({
      Bucket: settings.r2BucketName,
      Key: key,
      ContentType: args.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
    const publicBaseUrl = settings.r2PublicBaseUrl.replace(/\/+$/g, "");

    return {
      uploadUrl,
      fileUrl: `${publicBaseUrl}/${key}`,
      key,
    };
  },
});