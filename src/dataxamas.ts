import { DataxamasExceptions, DataxamasTracking } from "@dataxamas/tracker-js";
import { env } from "./lib/env";

const DATAXAMAS_URL = "https://dataxamas.com";

export const exceptions = env.VITE_DATAXAMAS_API_KEY
  ? new DataxamasExceptions({
      apiKey: env.VITE_DATAXAMAS_API_KEY,
      baseUrl: DATAXAMAS_URL,
      enabled: true,
      environment: import.meta.env.MODE,
    })
  : undefined;

export const tracking = env.VITE_DATAXAMAS_API_KEY
  ? new DataxamasTracking({ apiKey: env.VITE_DATAXAMAS_API_KEY, baseUrl: DATAXAMAS_URL })
  : undefined;
