import { to } from "@nickyzj2023/utils";
import express from "express";
import hljs from "highlight.js";
import { Marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import sharp from "sharp";
import { WEBDAV_PATH } from "@/libs/constants.js";
import { formatQuery, getFile, getFiles } from "@/libs/utils.js";

/** 博客文件夹在 dufs 的相对路径 */
const DIR = "/Nickyzj/Blogs";

/** markdown 转 html */
const marked = new Marked(
	{
		// 启用 Github Flavored Markdown 标准，支持表格、列表、删除线等
		gfm: true,
		// 支持单换行，更符合写作习惯
		breaks: true,
	},
	markedHighlight({
		emptyLangClass: "hljs",
		langPrefix: "hljs language-",
		highlight: (code, lang) => {
			const language = hljs.getLanguage(lang) ? lang : "plaintext";
			const result = hljs.highlight(code, { language });
			return result.value;
		},
	}),
	gfmHeadingId(),
);

/**
 * 初始化路由所需数据
 */

let years: number[] = [];
let pages = 0;

const init = async () => {
	console.time("初始化路由/blogs");

	// 读取年份范围
	const files = await getFiles(DIR, (a, b) => Number(b.name) - Number(a.name));
	years = files.map((file) => Number(file.name));
	pages = years.length;

	console.timeEnd("初始化路由/blogs");
};

init();

/**
 * 路由相关逻辑
 */

const router = express.Router();

router.get("/", async (req, res) => {
	const { page = 1 } = formatQuery(req.query);
	const year = years[page - 1];
	if (!year) {
		res.success({ page, pages, data: [] });
		return;
	}

	const files = await getFiles(
		`${DIR}/${year}`,
		(a, b) => b.created - a.created,
	);
	const data = files.map((file) => {
		const title = file.name.replace(".md", "");
		return {
			title,
			year,
			created: file.created,
			updated: file.modified,
		};
	});

	res.success({ page, pages, data });
});

router.get("/:year", async (req, res) => {
	const { year } = req.params;
	if (!years.includes(Number(year))) {
		res.success({ data: [] });
		return;
	}

	const files = await getFiles(
		`/${DIR}/${year}`,
		(a, b) => b.created - a.created,
	);
	const data = files.map((dir) => {
		return {
			title: dir.name,
			year,
			created: dir.created,
			updated: dir.modified,
		};
	});

	res.success({ data });
});

router.get("/:year/:title", async (req, res) => {
	const { year, title } = req.params;

	const [error, response] = await to(getFile(`${DIR}/${year}/${title}.md`));
	if (error) {
		res.fail(`读取文章失败：${error.message}`);
		return;
	}

	const file = await Bun.file(response.path).text();
	const content = marked.parse(file);
	const minutes = Math.ceil(file.length / 500);
	res.success({
		title,
		year,
		created: response.created,
		modified: response.modified,
		minutes,
		content,
	});
});

router.put("/:year/:title", async (req, res) => {
	const { title, year } = req.params;
	const { cover } = req.body;

	// 修改封面（前端传 base64）
	if (cover && typeof cover === "string") {
		const base64 = cover.includes(";base64,")
			? cover.split(";base64,").pop()
			: cover;
		if (!base64) {
			res.fail("封面处理失败：请确认提交的图片为base64格式");
			return;
		}
		const buffer = Buffer.from(base64, "base64");

		const fileOut = `${WEBDAV_PATH}/Nickyzj/Photos/Blogs/${title}.webp`;
		const [error] = await to(sharp(buffer).webp().toFile(fileOut));
		if (error) {
			res.fail(`封面处理失败：${error.message}`);
			return;
		}
	}

	res.success();
});

export default router;
