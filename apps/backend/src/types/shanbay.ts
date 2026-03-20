import { array, object, string } from "valibot";

export const ShanbayRawResponseSchema = object({
  id: string(),
  content: string(),
  translation: string(),
  author: string(),
  origin_img_urls: array(string()),
});
