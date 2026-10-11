import { setResponseHeader } from "h3";
import { listPublishedReviews } from "../../utils/reviews";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  return listPublishedReviews();
});
