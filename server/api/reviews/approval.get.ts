import { createError, getQuery, setResponseHeader } from "h3";
import { getPendingReview } from "../../utils/reviews";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const token = getQuery(event).token;
  if (typeof token !== "string" || token.length < 32 || token.length > 128) {
    throw createError({ statusCode: 400, statusMessage: "A jóváhagyó hivatkozás érvénytelen vagy lejárt." });
  }
  const review = await getPendingReview(token);
  if (!review) throw createError({ statusCode: 410, statusMessage: "A jóváhagyó hivatkozás érvénytelen, már felhasználták vagy lejárt." });
  return review;
});
