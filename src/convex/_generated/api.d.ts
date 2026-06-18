/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminChat from "../adminChat.js";
import type * as ads from "../ads.js";
import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth_password from "../auth/password.js";
import type * as categoryEntities from "../categoryEntities.js";
import type * as categoryHeroConfig from "../categoryHeroConfig.js";
import type * as comments from "../comments.js";
import type * as crons from "../crons.js";
import type * as events from "../events.js";
import type * as gtfs from "../gtfs.js";
import type * as gtfsActions from "../gtfsActions.js";
import type * as http from "../http.js";
import type * as investments from "../investments.js";
import type * as matchResults from "../matchResults.js";
import type * as media from "../media.js";
import type * as mediaLibrary from "../mediaLibrary.js";
import type * as menuItems from "../menuItems.js";
import type * as newsletter from "../newsletter.js";
import type * as obituaries from "../obituaries.js";
import type * as pages from "../pages.js";
import type * as politicians from "../politicians.js";
import type * as reels from "../reels.js";
import type * as seed from "../seed.js";
import type * as seedAuthors from "../seedAuthors.js";
import type * as seedCategoryData from "../seedCategoryData.js";
import type * as seedCategoryExamples from "../seedCategoryExamples.js";
import type * as seedMaster from "../seedMaster.js";
import type * as seedMedical from "../seedMedical.js";
import type * as seedUpdates from "../seedUpdates.js";
import type * as settings from "../settings.js";
import type * as sportPlayers from "../sportPlayers.js";
import type * as sportTeams from "../sportTeams.js";
import type * as stories from "../stories.js";
import type * as updates from "../updates.js";
import type * as users from "../users.js";
import type * as weather from "../weather.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminChat: typeof adminChat;
  ads: typeof ads;
  articles: typeof articles;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  "auth/password": typeof auth_password;
  categoryEntities: typeof categoryEntities;
  categoryHeroConfig: typeof categoryHeroConfig;
  comments: typeof comments;
  crons: typeof crons;
  events: typeof events;
  gtfs: typeof gtfs;
  gtfsActions: typeof gtfsActions;
  http: typeof http;
  investments: typeof investments;
  matchResults: typeof matchResults;
  media: typeof media;
  mediaLibrary: typeof mediaLibrary;
  menuItems: typeof menuItems;
  newsletter: typeof newsletter;
  obituaries: typeof obituaries;
  pages: typeof pages;
  politicians: typeof politicians;
  reels: typeof reels;
  seed: typeof seed;
  seedAuthors: typeof seedAuthors;
  seedCategoryData: typeof seedCategoryData;
  seedCategoryExamples: typeof seedCategoryExamples;
  seedMaster: typeof seedMaster;
  seedMedical: typeof seedMedical;
  seedUpdates: typeof seedUpdates;
  settings: typeof settings;
  sportPlayers: typeof sportPlayers;
  sportTeams: typeof sportTeams;
  stories: typeof stories;
  updates: typeof updates;
  users: typeof users;
  weather: typeof weather;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
