import { createFileRoute } from "@tanstack/react-router";
import {
  assertSameOrigin,
  createReviewCustomerSession,
  deleteReviewCustomerSession,
  getReviewCustomer,
  requestReviewCustomerAccess,
  registerReviewCustomer,
  signInReviewCustomer,
  reviewCustomerCookie,
  ReviewApiError,
  updateReviewCustomerProfile,
  updateReviewCustomerPassword,
} from "../../server/utils/reviews";

function errorResponse(error: unknown) {
  const status = error instanceof ReviewApiError ? error.statusCode : 500;
  if (status >= 500) console.error("Review customer account request failed", error);
  const message = status < 500 && error instanceof Error ? error.message : "A fiókművelet most nem sikerült.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return Response.json({ customer: await getReviewCustomer(request) }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) { return errorResponse(error); }
      },
      POST: async ({ request }) => {
        try {
          assertSameOrigin(request);
          let body: { action?: unknown; email?: unknown; name?: unknown; phone?: unknown; token?: unknown; password?: unknown };
          try { body = await request.json() as typeof body; } catch { throw new ReviewApiError(400, "A kérés nem értelmezhető."); }
          const action = String(body.action || "");
          if (action === "request_link") {
            await requestReviewCustomerAccess(request, body.email, body.name, body.phone);
            return Response.json({ ok: true, message: "Ha az e-mail-cím használható, elküldtük a belépőlinket." }, { headers: { "Cache-Control": "no-store" } });
          }
          if (action === "register") {
            await registerReviewCustomer(request, body.email, body.name, body.phone, body.password);
            return Response.json({ ok: true, message: "Elküldtük a megerősítő linket az e-mail-címedre. A fiók aktiválásához nyisd meg a levelet." }, { headers: { "Cache-Control": "no-store" } });
          }
          if (action === "password_login") {
            const result = await signInReviewCustomer(body.email, body.password);
            return Response.json({ ok: true, customer: result.customer }, { headers: { "Cache-Control": "no-store", "Set-Cookie": reviewCustomerCookie(result.session, false, new URL(request.url).protocol === "https:") } });
          }
          if (action === "login") {
            const result = await createReviewCustomerSession(typeof body.token === "string" ? body.token : "");
            if (!result) throw new ReviewApiError(410, "A belépőlink érvénytelen, lejárt vagy már felhasználták.");
            return Response.json({ ok: true, customer: result.customer }, { headers: { "Cache-Control": "no-store", "Set-Cookie": reviewCustomerCookie(result.session, false, new URL(request.url).protocol === "https:") } });
          }
          if (action === "logout") {
            await deleteReviewCustomerSession(request);
            return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store", "Set-Cookie": reviewCustomerCookie("", true, new URL(request.url).protocol === "https:") } });
          }
          if (action === "update_profile") {
            const customer = await getReviewCustomer(request);
            if (!customer) throw new ReviewApiError(401, "A profil módosításához lépj be.");
            const profile = await updateReviewCustomerProfile(customer.id, body.name, body.phone);
            return Response.json({ ok: true, customer: { ...customer, ...profile } }, { headers: { "Cache-Control": "no-store" } });
          }
          if (action === "update_password") {
            const customer = await getReviewCustomer(request);
            if (!customer) throw new ReviewApiError(401, "A jelszó módosításához lépj be.");
            await updateReviewCustomerPassword(customer.id, body.password);
            return Response.json({ ok: true, message: "A jelszavadat biztonságosan frissítettük." }, { headers: { "Cache-Control": "no-store" } });
          }
          throw new ReviewApiError(400, "Válassz érvényes fiókműveletet.");
        } catch (error) { return errorResponse(error); }
      },
    },
  },
});
