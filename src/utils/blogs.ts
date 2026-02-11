import { Database } from "bun:sqlite";
import type fs from "node:fs";
import { basename, relative } from "node:path";
import { timeLog } from "@nickyzj2023/utils";
import chokidar from "chokidar";
import { BLOGS_DIR, ROOT_PATH, WEBDAV_PATH } from "@/libs/constants";
import type { BlogItem } from "@/types/blogs";
import { extractYearFromPath, textToSlug } from "./common";

const db = new Database(`${ROOT_PATH}/data/sqlite.db`);

db.run(`
   CREATE TABLE IF NOT EXISTS blogs (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     title TEXT UNIQUE NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     year INTEGER NOT NULL,
     created_at DATETIME,
     updated_at DATETIME
   )
 `);

const insertStmt = db.prepare<
	{ changes: number },
	{
		$title: string;
		$slug: string;
		$year: number;
		$created_at: string;
		$updated_at: string;
	}
>(`
  INSERT OR IGNORE INTO blogs (title, slug, year, created_at, updated_at)
  VALUES ($title, $slug, $year, $created_at, $updated_at)
`);

const updateStmt = db.prepare<
	{ changes: number },
	{
		$title: string;
		$created_at: string;
		$updated_at: string;
	}
>(`
  UPDATE blogs
  SET created_at = $created_at,
      updated_at = $updated_at
  WHERE title = $title
`);

const deleteStmt = db.prepare<{ changes: number }, { $title: string }>(`
  DELETE FROM blogs WHERE title = $title
`);

export const listStmt = db.prepare<
	BlogItem,
	{ $limit: number; $offset: number }
>(`
  SELECT title, slug, year, created_at, updated_at
  FROM blogs
  ORDER BY created_at DESC
  LIMIT $limit OFFSET $offset
`);

export const countStmt = db.prepare<{ total: number }, []>(
	`SELECT COUNT(*) as total FROM blogs`,
);

export const getBySlugStmt = db.prepare<BlogItem, { $slug: string }>(`
  SELECT title, slug, year, created_at, updated_at
  FROM blogs
  WHERE slug = $slug
`);

/** 添加文章到数据库 */
const addFile = (path: string, stats?: fs.Stats) => {
	const title = basename(path, ".md");
	const slug = textToSlug(title);
	const filePath = relative(WEBDAV_PATH, path);
	const year = extractYearFromPath(filePath);
	const createdAt = stats?.birthtime?.toISOString() ?? "";
	const updatedAt = stats?.mtime?.toISOString() ?? "";

	const { changes } = insertStmt.run({
		$title: title,
		$slug: slug,
		$year: year,
		$created_at: createdAt,
		$updated_at: updatedAt,
	});
	if (changes > 0) {
		timeLog(`新增文章：${title}`);
	}

	return changes;
};

/** 更新数据库里的文章 */
const changeFile = (path: string, stats?: fs.Stats) => {
	const title = basename(path, ".md");
	const createdAt = stats?.birthtime?.toISOString() ?? "";
	const updatedAt = stats?.mtime?.toISOString() ?? "";

	const { changes } = updateStmt.run({
		$title: title,
		$created_at: createdAt,
		$updated_at: updatedAt,
	});
	if (changes > 0) {
		timeLog(`更新文章：${title}`);
	}

	return changes;
};

/** 删除数据库中的文章 */
const unlinkFile = (path: string) => {
	const title = basename(path, ".md");

	const { changes } = deleteStmt.run({ $title: title });
	if (changes > 0) {
		timeLog(`删除文章：${title}`);
	}

	return changes;
};

/**
 * 监听文章改动，汇报给 SQLite 数据表
 * @remarks 启动时全量同步所有文章，后续只监听今年和去年的
 */
export const watchBlogs = async () => {
	/**
	 * 一阶段：启动时全量同步所有历史文件
	 */

	console.time("全量同步文章");

	const initWatcher = chokidar.watch(BLOGS_DIR, {
		depth: 1,
		ignored: (path, stats) => {
			// 忽略非 .md 文件
			return stats?.isFile() === true && !path.endsWith(".md");
		},
	});

	// 把所有文章加入队列
	const initAddQueue: Array<{ path: string; stats?: fs.Stats }> = [];
	initWatcher.on("add", (path, stats) => {
		initAddQueue.push({ path, stats });
	});

	// 批量处理队列，使用事务优化性能
	const batchAdd = db.transaction(() => {
		initAddQueue.forEach(({ path, stats }) => {
			addFile(path, stats);
		});
		return initAddQueue.length;
	});

	// 等待扫描完成
	await new Promise<void>((resolve) => {
		initWatcher.on("ready", () => {
			batchAdd();
			initWatcher.close();
			resolve();
		});
	});

	console.timeEnd("全量同步文章");

	/**
	 * 二阶段：只监听近两年的
	 */

	const currentYear = new Date().getFullYear();
	const activeDirs = [currentYear, currentYear - 1].map(
		(year) => `${BLOGS_DIR}/${year}`,
	);

	const activeWatcher = chokidar.watch(activeDirs, {
		ignored: (path, stats) => {
			// 忽略非 .md 文件
			return stats?.isFile() === true && !path.endsWith(".md");
		},
		awaitWriteFinish: true,
	});

	activeWatcher
		.on("add", addFile)
		.on("change", changeFile)
		.on("unlink", unlinkFile)
		.on("ready", () => {
			timeLog(`开始监听目录`, activeDirs);
		});
};
