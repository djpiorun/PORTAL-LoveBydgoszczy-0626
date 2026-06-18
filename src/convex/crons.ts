import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "update GTFS data",
  "30 3 * * *", // 03:30 UTC is 05:30 CEST
  api.gtfsActions.updateGtfsData,
  {}
);

export default crons;
