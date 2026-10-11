import { createFileRoute } from "@tanstack/react-router";
import {
  applyReviewAdminAction,
  assertSameOrigin,
  createReviewAdminSession,
  deleteReviewAdminSession,
  getReviewIntegrationSettings,
  getReviewAdminDashboard,
  listAdminReviews,
  requireReviewAdmin,
  requestReviewAdminAccess,
  reviewAdminCookie,
  ReviewApiError,
  sendReviewAdminHandoffEmail,
  saveReviewIntegrationSettings,
  updateAdminGiftRequestStatus,
  syncReviewAdminEmail,
  type ReviewAdminStatus,
} from "../../server/utils/reviews";

function errorResponse(error: unknown) {
  const status = error instanceof ReviewApiError ? error.statusCode : 500;
  if (status >= 500) console.error("Review admin API request failed", error);
  const message = status < 500 && error instanceof Error ? error.message : "Az admin művelet most nem sikerült.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/reviews/admin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await syncReviewAdminEmail(request);
          await requireReviewAdmin(request);
          if (new URL(request.url).searchParams.get("resource") === "integrations") {
            return Response.json({ integrations: await getReviewIntegrationSettings() }, { headers: { "Cache-Control": "no-store" } });
          }
          if (new URL(request.url).searchParams.get("resource") === "dashboard") {
            return Response.json({ dashboard: await getReviewAdminDashboard() }, { headers: { "Cache-Control": "no-store" } });
          }
          const rawStatus = new URL(request.url).searchParams.get("status");
          const status: ReviewAdminStatus = rawStatus === "archived" || rawStatus === "deleted" ? rawStatus : "published";
          return Response.json({ reviews: await listAdminReviews(status), handoffEnabled: process.env["REVIEW_ADMIN_HANDOFF_ENABLED"] === "true" }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          return errorResponse(error);
        }
      },
      POST: async ({ request }) => {
        try {
          assertSameOrigin(request);
          await syncReviewAdminEmail(request);
          let body: { action?: unknown; token?: unknown; reviewId?: unknown; requestId?: unknown; requestStatus?: unknown; confirmed?: unknown; integrations?: unknown };
          try { body = await request.json() as typeof body; } catch { throw new ReviewApiError(400, "A kérés nem értelmezhető."); }
          const action = String(body.action || "");
          const secure = new URL(request.url).protocol === "https:";

          if (action === "request_access") {
            await requestReviewAdminAccess(request);
            return Response.json({ ok: true, message: "Ha az admin postafiók be van állítva, elküldtük a belépőlinket." }, { headers: { "Cache-Control": "no-store" } });
          }
          if (action === "login") {
            const session = await createReviewAdminSession(typeof body.token === "string" ? body.token : "");
            if (!session) throw new ReviewApiError(410, "A belépőlink érvénytelen, lejárt vagy már felhasználták.");
            return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store", "Set-Cookie": reviewAdminCookie(session, false, secure) } });
          }

          if (action === "logout") {
            await requireReviewAdmin(request);
            await deleteReviewAdminSession(request);
            return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store", "Set-Cookie": reviewAdminCookie("", true, secure) } });
          }

          await requireReviewAdmin(request);
          if (action === "send_handoff") {
            await sendReviewAdminHandoffEmail(request);
            return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
          }
          if (action === "save_integrations") {
            const integrations = await saveReviewIntegrationSettings(body.integrations);
            return Response.json({ ok: true, integrations }, { headers: { "Cache-Control": "no-store" } });
          }
          if (action === "update_gift_request") {
            if (typeof body.requestId !== "string" || !await updateAdminGiftRequestStatus(body.requestId, body.requestStatus)) {
              throw new ReviewApiError(404, "Az igénylés nem található, vagy az állapot nem érvényes.");
            }
            return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
          }
          if (!["archive", "restore", "delete", "purge"].includes(action) || typeof body.reviewId !== "string") {
            throw new ReviewApiError(400, "Válassz érvényes műveletet.");
          }
          if (action === "purge" && body.confirmed !== true) {
            throw new ReviewApiError(400, "A végleges törlést külön meg kell erősíteni.");
          }
          const changed = await applyReviewAdminAction(body.reviewId, action as "archive" | "restore" | "delete" | "purge");
          if (!changed) throw new ReviewApiError(404, "A vélemény már nem található, vagy közben megváltozott az állapota.");
          return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
