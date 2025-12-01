import { fetcher, to, withCache } from "@nickyzj2023/utils";
import { Router } from "express";
import * as v from "valibot";

const router = Router();

const Schema = v.object({
  id: v.string(),
  content: v.string(),
  translation: v.string(),
  author: v.number(),
  origin_img_urls: v.array(v.string()),
});
const get = withCache(
  fetcher("https://apiv3.shanbay.com/weapps").get,
  86400 /* 缓存一天 */,
);

router.get("/", async (req, res) => {
  const [error, response] = await to(get("/dailyquote/quote"));
  if (error) {
    res.fail(`查询扇贝每日一句失败: ${error.message}`);
    return;
  }

  const validation = v.safeParse(Schema, response);
  if (!validation.success) {
    res.fail(`扇贝每日一句数据结构有误: ${validation.issues[0].message}`);
    return;
  }

  res.success(validation.output);
});

export default router;
