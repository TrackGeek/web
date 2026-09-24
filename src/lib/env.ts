import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {},
	clientPrefix: "VITE_",
	client: {
		VITE_API_URL: z.string(),
    VITE_SITE_URL: z.string().optional(),
    VITE_OG_IMAGE_HOSTS: z.string().optional(),
		VITE_DATAXAMAS_API_KEY: z.string(),
	},
	runtimeEnv: {
		VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
    VITE_OG_IMAGE_HOSTS: import.meta.env.VITE_OG_IMAGE_HOSTS,
		VITE_DATAXAMAS_API_KEY: import.meta.env.VITE_DATAXAMAS_API_KEY,
	},
	emptyStringAsUndefined: true,
});
