import { ENV } from "@/@config/env.config";
import ReviewsLoad from "@/@components/pages/Reviews/ReviewsLoad";
import { IReview } from "@/@interfaces/Reviews/reviews.interface";

export const revalidate = 60;

async function getInitialProducts(): Promise<IReview[]> {
  try {
    const qs = new URLSearchParams({
      page: "1",
      limit: "21",
    });
    const rawUrl = `${ENV.ApiEndpoint?.trim()}/review?${qs}`;
    const safeUrl = encodeURI(rawUrl);

    const res = await fetch(safeUrl, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch initial reviews");
      return [];
    }

    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const initialProducts = await getInitialProducts();
  return <ReviewsLoad initialProducts={initialProducts} />;
}
