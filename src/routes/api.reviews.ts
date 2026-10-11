import { createFileRoute } from "@tanstack/react-router";
import {
  assertSameOrigin,
  enforceReviewRateLimit,
  listPublishedReviews,
  ReviewApiError,
  submitReview,
  validateReviewInput,
} from "../../server/utils/reviews";

function errorResponse(error: unknown) {
  const status = error instanceof ReviewApiError ? error.statusCode : 500;
  if (status >= 500) console.error("Review API request failed", error);
  const message = status < 500 && error instanceof Error
    ? error.message
    : "A szerver most nem tudta fogadni a véleményt. Próbáld meg később újra.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/reviews")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await listPublishedReviews(), { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          return errorResponse(error);
        }
      },
      POST: async ({ request }) => {
        try {
          assertSameOrigin(request);
          enforceReviewRateLimit(request);
          let body: unknown;
          try {
            body = await request.json();
          } catch {
            throw new ReviewApiError(400, "Ellenőrizd a kitöltött mezőket.");
          }
          const input = validateReviewInput(body);
          await submitReview(input, new URL(request.url).origin);
          return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
