import { Migrations } from "@convex-dev/migrations";

import { CONSTRAINTS } from "./types";

import { components } from "./_generated/api.js";

export const migrations = new Migrations(components.migrations);
export const run = migrations.runner();

export const backfillTermField = migrations.define({
  table: "user_scenarios",
  async migrateOne(_, scenario) {
    if (typeof scenario.term === "undefined") return { term: CONSTRAINTS.TERM.CURRENT };
  },
});
