import { createFileRoute } from "@tanstack/react-router";
import {
  applyPendingReviewAction,
  assertSameOrigin,
  getPendingReview,
  ReviewApiError,
} from "../../server/utils/reviews";

function errorResponse(error: unknown) {
  const status = error instanceof ReviewApiError ? error.statusCode : 500;
  if (status >= 500) console.error("Review approval API request failed", error);
  const message = error instanceof Error ? error.message : "A kérés most nem sikerült.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/reviews/approval")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const token = new URL(request.url).searchParams.get("token") ?? "";
          if (token.length < 32 || token.length > 128) {
            throw new ReviewApiError(400, "A jóváhagyó hivatkozás érvénytelen vagy lejárt.");
          }
          const review = await getPendingReview(token);
          if (!review) throw new ReviewApiError(410, "A jóváhagyó hivatkozás érvénytelen, már felhasználták vagy lejárt.");
          return Response.json(review, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          return errorResponse(error);
        }
      },
      POST: async ({ request }) => {
        try {
          assertSameOrigin(request);
          const body = await request.json() as { token?: unknown; action?: unknown };
          const token = typeof body?.token === "string" ? body.token : "";
          const action = body?.action;
          if (token.length < 32 || token.length > 128 || !["approve", "archive", "delete"].includes(String(action))) {
            throw new ReviewApiError(410, "A jóváhagyó hivatkozás érvénytelen, már felhasználták vagy lejárt.");
          }
          const applied = await applyPendingReviewAction(token, action as "approve" | "archive" | "delete");
          if (!applied) throw new ReviewApiError(410, "A jóváhagyó hivatkozás érvénytelen, már felhasználták vagy lejárt.");
          return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
