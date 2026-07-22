interface IENV {
  ApiEndpoint: string;
  SITE_KEY: string;
  env: string | null;
  GTM_CODE: any;
  APP_URL: any;
}

// Helper to validate and normalize API endpoint URL
const getApiEndpoint = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const fallback = "http://localhost:5000/api/v1";

  if (
    !envUrl ||
    envUrl.trim() === "" ||
    envUrl.trim().toLowerCase() === "null" ||
    envUrl.trim().toLowerCase() === "undefined"
  ) {
    if (typeof window !== "undefined") {
      console.warn(
        "[ENV] NEXT_PUBLIC_BASE_URL is not set. Using fallback:",
        fallback,
      );
    }
    return fallback;
  }

  try {
    // Validate it's a proper URL
    new URL(envUrl);
    return envUrl.trim();
  } catch (error) {
    console.error(
      "[ENV] Invalid NEXT_PUBLIC_BASE_URL:",
      envUrl,
      ". Using fallback:",
      fallback,
    );
    return fallback;
  }
};

// Helper to normalize APP_URL (used in metadata)
const getAppUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_APP_URL;

  if (
    !raw ||
    raw.trim() === "" ||
    raw.trim().toLowerCase() === "null" ||
    raw.trim().toLowerCase() === "undefined"
  ) {
    return "";
  }

  return raw.trim();
};

export const ENV: IENV = {
  ApiEndpoint: getApiEndpoint(),
  SITE_KEY: process.env.SECRET_KEY || "",
  env: process.env.NEXT_PUBLIC_ENV || null,
  GTM_CODE: process.env.GTM_CODE,
  APP_URL: getAppUrl(),
};
