"use node";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import JSZip from "jszip";
import Papa from "papaparse";

export const updateGtfsData = action({
  args: {},
  handler: async (ctx) => {
    console.log("Fetching GTFS zip...");
    const res = await fetch("https://zdmikp.bydgoszcz.pl/rozklady/paczka/gtfs/gtfs.zip");
    if (!res.ok) throw new Error("Failed to fetch GTFS zip");
    const arrayBuffer = await res.arrayBuffer();
    
    console.log("Unzipping...");
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const parseFile = async (filename: string) => {
      const file = zip.file(filename);
      if (!file) return [];
      const text = await file.async("text");
      return Papa.parse(text, { header: true, skipEmptyLines: true }).data as any[];
    };

    console.log("Parsing files...");
    const [routesRaw, stopsRaw, tripsRaw, stopTimesRaw, calendarDatesRaw] = await Promise.all([
      parseFile("routes.txt"),
      parseFile("stops.txt"),
      parseFile("trips.txt"),
      parseFile("stop_times.txt"),
      parseFile("calendar_dates.txt"),
    ]);

    console.log("Processing data...");
    
    const routes = routesRaw.map(r => ({
      route_id: r.route_id,
      route_short_name: r.route_short_name,
      route_long_name: r.route_long_name,
      route_type: r.route_type,
    }));

    const stops = stopsRaw.map(s => ({
      stop_id: s.stop_id,
      stop_name: s.stop_name,
      stop_lat: s.stop_lat,
      stop_lon: s.stop_lon,
    }));
    const stopsMap = new Map(stops.map(s => [s.stop_id, s.stop_name]));

    const tripsMap = new Map(tripsRaw.map(t => [t.trip_id, t]));
    const routesMap = new Map(routes.map(r => [r.route_id, r]));

    const routeTrips = new Map<string, any[]>();
    for (const t of tripsRaw) {
      if (!routeTrips.has(t.route_id)) routeTrips.set(t.route_id, []);
      routeTrips.get(t.route_id)!.push(t);
    }

    const tripStops = new Map<string, any[]>();
    for (const st of stopTimesRaw) {
      if (!tripStops.has(st.trip_id)) tripStops.set(st.trip_id, []);
      tripStops.get(st.trip_id)!.push(st);
    }

    const routeDetails = [];
    for (const [route_id, trips] of routeTrips.entries()) {
      const dirs = new Map<string, any>();
      for (const t of trips) {
        const key = `${t.direction_id}_${t.trip_headsign}`;
        const stopsForTrip = tripStops.get(t.trip_id) || [];
        if (!dirs.has(key) || dirs.get(key).stops.length < stopsForTrip.length) {
          dirs.set(key, {
            direction_id: t.direction_id,
            headsign: t.trip_headsign,
            stops: stopsForTrip.sort((a: any, b: any) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence)).map((st: any) => ({
              stop_id: st.stop_id,
              stop_name: stopsMap.get(st.stop_id) || st.stop_id,
            }))
          });
        }
      }
      routeDetails.push({
        route_id,
        directions: Array.from(dirs.values()),
      });
    }

    const stopDeparturesMap = new Map<string, any[]>();
    for (const st of stopTimesRaw) {
      const trip = tripsMap.get(st.trip_id);
      if (!trip) continue;
      const route = routesMap.get(trip.route_id);
      if (!route) continue;

      if (!stopDeparturesMap.has(st.stop_id)) stopDeparturesMap.set(st.stop_id, []);
      stopDeparturesMap.get(st.stop_id)!.push({
        route_id: route.route_id,
        route_short_name: route.route_short_name,
        route_type: route.route_type,
        service_id: trip.service_id,
        departure_time: st.departure_time,
        trip_headsign: trip.trip_headsign,
        direction_id: trip.direction_id,
      });
    }

    const stopDepartures = Array.from(stopDeparturesMap.entries()).map(([stop_id, deps]) => ({
      stop_id,
      departures: deps,
    }));

    const calendarMap = new Map<string, Set<string>>();
    for (const c of calendarDatesRaw) {
      if (c.exception_type === "1") {
        if (!calendarMap.has(c.date)) calendarMap.set(c.date, new Set());
        calendarMap.get(c.date)!.add(c.service_id);
      }
    }
    const calendar = Array.from(calendarMap.entries()).map(([date, services]) => ({
      date,
      active_services: Array.from(services),
    }));

    console.log("Syncing data with diff approach...");
    
    const chunkArray = (arr: any[], size: number) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    const syncTime = Date.now();

    const syncTable = async (
      tableName: string, 
      newData: any[], 
      upsertMutation: any,
      argName: string,
      chunkSize: number,
      deleteBatchSize: number = 50
    ) => {
      console.log(`Upserting ${newData.length} records to ${tableName}...`);
      for (const chunk of chunkArray(newData, chunkSize)) {
        await ctx.runMutation(upsertMutation, { [argName]: chunk, syncTime });
      }

      console.log(`Deleting stale records from ${tableName}...`);
      let hasMore = true;
      let cursor = null;
      while (hasMore) {
        const result: any = await ctx.runMutation(internal.gtfs.deleteStale, { 
          table: tableName, 
          syncTime,
          batchSize: deleteBatchSize,
          cursor
        });
        hasMore = result.hasMore;
        cursor = result.cursor;
      }
    };

    await syncTable("gtfs_routes", routes, internal.gtfs.upsertRoutes, "routes", 100);
    await syncTable("gtfs_stops", stops, internal.gtfs.upsertStops, "stops", 100);
    await syncTable("gtfs_route_details", routeDetails, internal.gtfs.upsertRouteDetails, "routeDetails", 20, 20);
    await syncTable("gtfs_stop_departures", stopDepartures, internal.gtfs.upsertStopDepartures, "stopDepartures", 5, 5);
    await syncTable("gtfs_calendar", calendar, internal.gtfs.upsertCalendar, "calendar", 100);

    await ctx.runMutation(internal.gtfs.updateMetadata, { last_update: new Date().toISOString() });
    console.log("GTFS update complete!");
  }
});