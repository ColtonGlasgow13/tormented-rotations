import { defineFunction } from "@aws-amplify/backend";

import dotenvx from "@dotenvx/dotenvx";

dotenvx.config();

if (!process.env.REQUEST_TABLE_NAME || !process.env.GROUPPLACEMENT_TABLE_NAME) {
  throw new Error("Set environment variables");
}

const resolverEnvironment = {
  REQUEST_TABLE_NAME: process.env.REQUEST_TABLE_NAME,
  GROUPPLACEMENT_TABLE_NAME: process.env.GROUPPLACEMENT_TABLE_NAME,
};

export const formGroup = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: "form-group",
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: "./handler.ts",
  environment: resolverEnvironment,
});
