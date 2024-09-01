import { z } from "zod";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string().min(1) : z.string().url()
  ),
  AWS_KEY: z.string().optional(),
  AWS_SECRET: z.string().optional(),
  AWS_REGION: z.string(),
  AWS_LOG_REGION: z.string(),
  AWS_BUCKET: z.string(),
  LOG_GROUP_NAME: z.string(),
  LOG_STREAM_NAME: z.string(),
  DISABLE_LOG: z.string(),
  MAIL_FROM_ADDRESS: z.string(),
  ADMINSTRATOR_MAIL: z.string(),
  TELKOM_ADMIN_MAIL: z.string(),
  ISSUER: z.string(),
  ALGORITHM: z.string(),
  QSUREURL: z.string(),
  QSURECLIENTID: z.string(),
  XCELERATEUSERNAME: z.string(),
  XCELERATEPASSWORD: z.string(),
  FILEINTEGRATIONUSERNAME: z.string(),
  SUB_ACCOUNT_UNIQUE_ID: z.string(),
  DRUPAL_API_URL: z.string().optional(),
  // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_ENVIRONMENT: z.enum([
    "LOCAL",
    "DEVELOPMENT",
    "UAT",
    "PRODUCTION",
  ]),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  AWS_KEY: process.env.AWS_KEY,
  AWS_SECRET: process.env.AWS_SECRET,
  AWS_REGION: process.env.AWS_REGION,
  AWS_LOG_REGION: process.env.AWS_LOG_REGION,
  AWS_BUCKET: process.env.AWS_BUCKET,
  LOG_GROUP_NAME: process.env.LOG_GROUP_NAME,
  LOG_STREAM_NAME: process.env.LOG_STREAM_NAME,
  DISABLE_LOG: process.env.DISABLE_LOG,
  MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,
  TELKOM_ADMIN_MAIL: process.env.TELKOM_ADMIN_MAIL,
  ADMINSTRATOR_MAIL: process.env.ADMINSTRATOR_MAIL,
  ISSUER: process.env.ISSUER,
  ALGORITHM: process.env.ALGORITHM,
  QSUREURL: process.env.QSUREURL,
  QSURECLIENTID: process.env.QSURECLIENTID,
  XCELERATEUSERNAME: process.env.XCELERATEUSERNAME,
  XCELERATEPASSWORD: process.env.XCELERATEPASSWORD,
  FILEINTEGRATIONUSERNAME: process.env.FILEINTEGRATIONUSERNAME,
  SUB_ACCOUNT_UNIQUE_ID: process.env.SUB_ACCOUNT_UNIQUE_ID,
  DRUPAL_API_URL: process.env.CMS_API_URL,
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined";
  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  );

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env };
