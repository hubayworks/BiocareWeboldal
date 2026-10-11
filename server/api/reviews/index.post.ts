import { getRequestURL, readBody } from "h3";
import { assertSameOrigin, enforceReviewRateLimit, submitReview, validateReviewInput } from "../../utils/reviews";

export default defineEventHandler(async (event) => {
  assertSameOrigin(event);
  enforceReviewRateLimit(event);
  const input = validateReviewInput(await readBody(event));
  await submitReview(input, getRequestURL(event).origin);
  return { ok: true };
});
