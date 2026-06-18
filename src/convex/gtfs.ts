import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const deleteStale = internalMutation({
  args: { table: v.string(), syncTime: v.number(), batchSize: v.optional(v.number()), cursor: v.optional(v.union(v.string(), v.null())) },
  handler: async (ctx, args) => {
    const limit = args.batchSize ?? 50;
    
    const staleDocs = await ctx.db.query(args.table as any)
      .withIndex("by_last_seen", q => q.lt("last_seen", args.syncTime))
      .take(limit);
      
    if (staleDocs.length > 0) {
      for (const doc of staleDocs) {
        await ctx.db.delete(doc._id);
      }
      return { hasMore: true, cursor: args.cursor };
    }

    const paginated = await ctx.db.query(args.table as any)
      .paginate({ cursor: args.cursor ?? null, numItems: limit });
      
    let deletedCount = 0;
    for (const doc of paginated.page) {
      if (doc.last_seen === undefined || doc.last_seen < args.syncTime) {
        await ctx.db.delete(doc._id);
        deletedCount++;
      }
    }
    
    if (paginated.isDone && deletedCount === 0) {
      return { hasMore: false, cursor: null };
    }
    
    return { hasMore: true, cursor: paginated.continueCursor };
  }
});

export const upsertRoutes = internalMutation({
  args: { routes: v.array(v.any()), syncTime: v.number() },
  handler: async (ctx, args) => {
    for (const r of args.routes) {
      const existing = await ctx.db.query("gtfs_routes").withIndex("by_route_id", q => q.eq("route_id", r.route_id)).first();
      if (existing) {
        await ctx.db.replace(existing._id, { ...r, last_seen: args.syncTime });
      } else {
        await ctx.db.insert("gtfs_routes", { ...r, last_seen: args.syncTime });
      }
    }
  }
});

export const upsertStops = internalMutation({
  args: { stops: v.array(v.any()), syncTime: v.number() },
  handler: async (ctx, args) => {
    for (const s of args.stops) {
      const existing = await ctx.db.query("gtfs_stops").withIndex("by_stop_id", q => q.eq("stop_id", s.stop_id)).first();
      if (existing) {
        await ctx.db.replace(existing._id, { ...s, last_seen: args.syncTime });
      } else {
        await ctx.db.insert("gtfs_stops", { ...s, last_seen: args.syncTime });
      }
    }
  }
});

export const upsertRouteDetails = internalMutation({
  args: { routeDetails: v.array(v.any()), syncTime: v.number() },
  handler: async (ctx, args) => {
    for (const rd of args.routeDetails) {
      const existing = await ctx.db.query("gtfs_route_details").withIndex("by_route_id", q => q.eq("route_id", rd.route_id)).first();
      if (existing) {
        await ctx.db.replace(existing._id, { ...rd, last_seen: args.syncTime });
      } else {
        await ctx.db.insert("gtfs_route_details", { ...rd, last_seen: args.syncTime });
      }
    }
  }
});

export const upsertStopDepartures = internalMutation({
  args: { stopDepartures: v.array(v.any()), syncTime: v.number() },
  handler: async (ctx, args) => {
    for (const sd of args.stopDepartures) {
      const existing = await ctx.db.query("gtfs_stop_departures").withIndex("by_stop_id", q => q.eq("stop_id", sd.stop_id)).first();
      if (existing) {
        await ctx.db.replace(existing._id, { ...sd, last_seen: args.syncTime });
      } else {
        await ctx.db.insert("gtfs_stop_departures", { ...sd, last_seen: args.syncTime });
      }
    }
  }
});

export const upsertCalendar = internalMutation({
  args: { calendar: v.array(v.any()), syncTime: v.number() },
  handler: async (ctx, args) => {
    for (const c of args.calendar) {
      const existing = await ctx.db.query("gtfs_calendar").withIndex("by_date", q => q.eq("date", c.date)).first();
      if (existing) {
        await ctx.db.replace(existing._id, { ...c, last_seen: args.syncTime });
      } else {
        await ctx.db.insert("gtfs_calendar", { ...c, last_seen: args.syncTime });
      }
    }
  }
});

export const updateMetadata = internalMutation({
  args: { last_update: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("gtfs_metadata").first();
    if (existing) {
      await ctx.db.patch(existing._id, { last_update: args.last_update });
    } else {
      await ctx.db.insert("gtfs_metadata", { last_update: args.last_update });
    }
  }
});

export const getMetadata = query({
  handler: async (ctx) => {
    return await ctx.db.query("gtfs_metadata").first();
  }
});

export const getRoutes = query({
  handler: async (ctx) => {
    return await ctx.db.query("gtfs_routes").take(500);
  }
});

export const getRouteDetails = query({
  args: { route_short_name: v.string() },
  handler: async (ctx, args) => {
    const routes = await ctx.db.query("gtfs_routes")
      .filter(q => q.eq(q.field("route_short_name"), args.route_short_name))
      .collect();
    
    if (routes.length === 0) return null;
    
    const details = [];
    for (const r of routes) {
      const d = await ctx.db.query("gtfs_route_details")
        .withIndex("by_route_id", q => q.eq("route_id", r.route_id))
        .first();
      if (d) details.push({ route: r, directions: d.directions });
    }
    return details;
  }
});

export const getStop = query({
  args: { stop_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("gtfs_stops")
      .withIndex("by_stop_id", q => q.eq("stop_id", args.stop_id))
      .first();
  }
});

export const getStopDepartures = query({
  args: { stop_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("gtfs_stop_departures")
      .withIndex("by_stop_id", q => q.eq("stop_id", args.stop_id))
      .first();
  }
});

export const getActiveServices = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const cal = await ctx.db.query("gtfs_calendar")
      .withIndex("by_date", q => q.eq("date", args.date))
      .first();
    return cal ? cal.active_services : [];
  }
});

export const searchStops = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    const q = args.searchQuery.toLowerCase();
    // Use search index if available, otherwise limit scan
    const allStops = await ctx.db.query("gtfs_stops").take(2000);
    const matchedStops = allStops.filter(s => s.stop_name.toLowerCase().includes(q)).slice(0, 15);
    
    const results = [];
    for (const stop of matchedStops) {
      const deps = await ctx.db.query("gtfs_stop_departures")
        .withIndex("by_stop_id", q => q.eq("stop_id", stop.stop_id))
        .first();
      
      const routes = deps ? Array.from(new Set(deps.departures.map((d: any) => d.route_short_name))) : [];
      results.push({
        ...stop,
        routes
      });
    }
    return results;
  }
});