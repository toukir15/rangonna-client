interface IENV {
  ApiEndpoint: string | null;
  SITE_KEY: string;
}

const getAdminApiEndpoint = (): string | null => {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL?.trim();
  if (adminUrl) return adminUrl;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (baseUrl) return `${baseUrl.replace(/\/$/, "")}/admin`;

  return null;
};

export const ENV: IENV = {
  ApiEndpoint: getAdminApiEndpoint(),
  SITE_KEY: process.env.SECRET_KEY || "",
};
