import { createFileRoute } from "@tanstack/react-router";
import {
  assertSameOrigin,
  enforceReviewRateLimit,
  getReviewCustomer,
  listCustomerReviews,
  ReviewApiError,
  submitReview,
  validateReviewInput,
  withdrawCustomerReview,
} from "../../server/utils/reviews";

function errorResponse(error: unknown) {
  const status = error instanceof ReviewApiError ? error.statusCode : 500;
  if (status >= 500) console.error("Review customer review request failed", error);
  const message = status < 500 && error instanceof Error ? error.message : "A vélemény művelete most nem sikerült.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/account/reviews")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const customer = await getReviewCustomer(request);
          if (!customer) throw new ReviewApiError(401, "A saját vélemények megtekintéséhez lépj be.");
          return Response.json({ reviews: await listCustomerReviews(customer.id) }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) { return errorResponse(error); }
      },
      POST: async ({ request }) => {
        try {
          assertSameOrigin(request);
          const customer = await getReviewCustomer(request);
          if (!customer) throw new ReviewApiError(401, "A vélemény beküldéséhez lépj be a fiókodba.");
          enforceReviewRateLimit(request);
          let body: Record<string, unknown>;
          try { body = await request.json() as Record<string, unknown>; } catch { throw new ReviewApiError(400, "Ellenőrizd a kitöltött mezőket."); }
          const input = validateReviewInput({ ...body, name: customer.name });
          await submitReview(input, new URL(request.url).origin, customer.id);
          return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
        } catch (error) { return errorResponse(error); }
      },
      DELETE: async ({ request }) => {
        try {
          assertSameOrigin(request);
          const customer = await getReviewCustomer(request);
          if (!customer) throw new ReviewApiError(401, "A vélemény visszavonásához lépj be a fiókodba.");
          let body: { reviewId?: unknown };
          try { body = await request.json() as typeof body; } catch { throw new ReviewApiError(400, "A kérés nem értelmezhető."); }
          if (typeof body.reviewId !== "string" || !await withdrawCustomerReview(customer.id, body.reviewId)) {
            throw new ReviewApiError(404, "A vélemény nem található a fiókodban.");
          }
          return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) { return errorResponse(error); }
      },
    },
  },
});
