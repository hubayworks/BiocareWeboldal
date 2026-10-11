import { createError, readBody } from "h3";
import { assertSameOrigin, applyPendingReviewAction } from "../../utils/reviews";

export default defineEventHandler(async (event) => {
  assertSameOrigin(event);
  const body = await readBody<{ token?: unknown }>(event);
  const action = body?.action;
  const token = typeof body?.token === "string" ? body.token : "";
  if (token.length < 32 || token.length > 128 || !["approve", "archive", "delete"].includes(String(action)) || !(await applyPendingReviewAction(token, action as "approve" | "archive" | "delete"))) {
    throw createError({ statusCode: 410, statusMessage: "A jóváhagyó hivatkozás érvénytelen, már felhasználták vagy lejárt." });
  }
  return { ok: true };
});
