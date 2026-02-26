import type { Stats } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, relative } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Blog } from "@nickyzj/shared-types";
import { log } from "@nickyzj2023/utils";
import { extractYearFromPath, textToSlug } from "../common";
import { ROOT_PATH, WEBDAV_PATH } from "../constants";
import { renderMarkdown } from "../markdown";

const db = new DatabaseSync(`${ROOT_PATH}/data/sqlite.db`);

db.exec(`
   CREATE TABLE IF NOT EXISTS blogs (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     title TEXT UNIQUE NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     year INTEGER NOT NULL,
     created_at DATETIME,
     updated_at DATETIME,
     html TEXT
   )
 `);

const saveStmt = db.prepare(`
  INSERT INTO blogs (title, slug, year, created_at, updated_at, html)
  VALUES ($title, $slug, $year, $created_at, $updated_at, $html)
  ON CONFLICT(title) DO UPDATE SET
    slug = excluded.slug,
    year = excluded.year,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at,
    html = excluded.html
`);

const deleteStmt = db.prepare(`
  DELETE FROM blogs WHERE title = $title
`);

export const listStmt = db.prepare(`
  SELECT title, slug, year, created_at, updated_at
  FROM blogs
  ORDER BY created_at DESC
  LIMIT $limit OFFSET $offset
`);

export const countStmt = db.prepare(`SELECT COUNT(*) as total FROM blogs`);

export const getBySlugStmt = db.prepare(`
  SELECT title, slug, year, created_at, updated_at, html
  FROM blogs
  WHERE slug = $slug
`);

/** 保存文章到数据库（新增或更新） */
export const saveBlog = async (path: string, stats?: Stats) => {
	const title = basename(path, ".md");
	const slug = textToSlug(title);
	const filePath = relative(WEBDAV_PATH, path);
	const year = extractYearFromPath(filePath);
	const createdAt = stats?.birthtime?.toISOString() ?? "";
	const updatedAt = stats?.mtime?.toISOString() ?? "";

	// 检查文章是否存在
	const existing = getBySlugStmt.get({ $slug: slug }) as
		| (Blog & { html: string })
		| undefined;

	// 如果不存在，则插入新记录
	if (!existing) {
		// 读取文件内容并渲染为 html
		const text = await readFile(path, "utf-8");
		const html = await renderMarkdown(text);

		saveStmt.run({
			$title: title,
			$slug: slug,
			$year: year,
			$created_at: createdAt,
			$updated_at: updatedAt,
			$html: html,
		});
		log(`新增文章：${title}`);
		return;
	}

	// 如果存在，先检查有无变化
	const hasChanged = existing.updated_at !== updatedAt;
	if (!hasChanged) return;

	// 如果有变化，则更新记录
	const text = await readFile(path, "utf-8");
	const html = await renderMarkdown(text);

	saveStmt.run({
		$title: title,
		$slug: slug,
		$year: year,
		$created_at: createdAt,
		$updated_at: updatedAt,
		$html: html,
	});
	log(`更新文章：${title}`);
};

/** 删除数据库中的文章 */
export const deleteBlog = (path: string) => {
	const title = basename(path, ".md");

	const result = deleteStmt.run({ $title: title }) as { changes: number };
	if (result.changes > 0) {
		log(`删除文章：${title}`);
	}

	return result.changes;
};
