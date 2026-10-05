import { Dataxamas } from "@dataxamas/tracker-js";
import { env } from "./lib/env";

export const dataxamas = env.VITE_DATAXAMAS_API_KEY ? new Dataxamas({ apiKey: env.VITE_DATAXAMAS_API_KEY }) : undefined;
