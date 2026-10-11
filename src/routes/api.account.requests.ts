import { createFileRoute } from "@tanstack/react-router";
import {
  assertSameOrigin,
  createCustomerGiftRequest,
  getReviewCustomer,
  listCustomerGiftRequests,
  ReviewApiError,
} from "../../server/utils/reviews";

function errorResponse(error: unknown) {
  const status = error instanceof ReviewApiError ? error.statusCode : 500;
  if (status >= 500) console.error("Customer request API failed", error);
  const message = status < 500 && error instanceof Error ? error.message : "Az igénylés most nem sikerült.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/account/requests")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const customer = await getReviewCustomer(request);
          if (!customer) throw new ReviewApiError(401, "Az igénylések megtekintéséhez lépj be.");
          return Response.json({ requests: await listCustomerGiftRequests(customer.id) }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) { return errorResponse(error); }
      },
      POST: async ({ request }) => {
        try {
          assertSameOrigin(request);
          const customer = await getReviewCustomer(request);
          if (!customer) throw new ReviewApiError(401, "Az igényléshez lépj be a fiókodba.");
          let body: { kind?: unknown; details?: unknown };
          try { body = await request.json() as typeof body; } catch { throw new ReviewApiError(400, "Ellenőrizd az igénylés adatait."); }
          const id = await createCustomerGiftRequest(customer, body.kind, body.details);
          return Response.json({ ok: true, id }, { status: 201, headers: { "Cache-Control": "no-store" } });
        } catch (error) { return errorResponse(error); }
      },
    },
  },
});
