import { Database } from "bun:sqlite";
import type fs from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, relative } from "node:path";
import { timeLog } from "@nickyzj2023/utils";
import chokidar from "chokidar";
import { ANIMES_DIR, ROOT_PATH, WEBDAV_PATH } from "@/libs/constants.js";
import type { AnimeItem } from "@/types/animes";
import { extractSeasonFromPath, textToSlug } from "@/utils/common";

const log = (...args: any[]) => timeLog("[animes]", ...args);

const db = new Database(`${ROOT_PATH}/data/sqlite.db`);

db.run(`
  CREATE TABLE IF NOT EXISTS animes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    season TEXT NOT NULL,
    eps INTEGER NOT NULL,
    episodes TEXT NOT NULL DEFAULT '[]',
    created_at DATETIME,
    updated_at DATETIME
  )
`);

const saveStmt = db.prepare<
	{ changes: number },
	{
		$title: string;
		$slug: string;
		$season: string;
		$eps: number;
		$episodes: string;
		$created_at: string;
		$updated_at: string;
	}
>(`
  INSERT INTO animes (title, slug, season, eps, episodes, created_at, updated_at)
  VALUES ($title, $slug, $season, $eps, $episodes, $created_at, $updated_at)
  ON CONFLICT(title) DO UPDATE SET
    slug = excluded.slug,
    season = excluded.season,
    eps = excluded.eps,
    episodes = excluded.episodes,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at
`);

const deleteStmt = db.prepare<{ changes: number }, { $title: string }>(`
  DELETE FROM animes WHERE title = $title
`);

// 列表查询不返回 episodes 字段，避免数据过大
export const listStmt = db.prepare<
	AnimeItem,
	{ $limit: number; $offset: number }
>(`
  SELECT title, slug, season, eps, created_at, updated_at
  FROM animes
  ORDER BY updated_at DESC
  LIMIT $limit OFFSET $offset
`);

export const countStmt = db.prepare<{ total: number }, []>(
	`SELECT COUNT(*) as total FROM animes`,
);

export const getBySlugStmt = db.prepare<AnimeItem, { $slug: string }>(`
  SELECT *
  FROM animes
  WHERE slug = $slug
`);

const saveAnime = async (path: string, stats?: fs.Stats) => {
	const title = basename(path);
	const slug = textToSlug(title);
	const filePath = relative(WEBDAV_PATH, path);
	const season = extractSeasonFromPath(filePath);
	const episodes = await readdir(path);
	const eps = episodes.length;
	const createdAt = stats?.birthtime?.toISOString() ?? "";
	const updatedAt = stats?.mtime?.toISOString() ?? "";

	// 检查番剧是否存在
	const existing = getBySlugStmt.get({ $slug: slug });

	// 如果不存在，则插入新记录
	if (!existing) {
		saveStmt.run({
			$title: title,
			$slug: slug,
			$season: season,
			$eps: eps,
			$episodes: JSON.stringify(episodes),
			$created_at: createdAt,
			$updated_at: updatedAt,
		});
		log(`新增番剧：${title}，共${eps}话`);
		return;
	}

	// 如果存在，则检查是否有变化
	const hasChanged =
		existing.season !== season ||
		existing.created_at !== createdAt ||
		existing.updated_at !== updatedAt;

	if (!hasChanged) {
		return;
	}

	// 如果有变化，则更新记录
	saveStmt.run({
		$title: title,
		$slug: slug,
		$season: season,
		$eps: eps,
		$episodes: JSON.stringify(episodes),
		$created_at: createdAt,
		$updated_at: updatedAt,
	});
	log(`更新番剧：${title}，共${eps}话`);
};

const unlinkFile = (path: string) => {
	const title = basename(path);

	const { changes } = deleteStmt.run({ $title: title });
	if (changes > 0) {
		log(`删除番剧：${title}`);
	}

	return changes;
};

/** 计算相对路径的深度 */
const getPathDepth = (relativePath: string) => {
	return relativePath.split(/[\\/]/).filter(Boolean).length;
};

/** 获取当前番剧季度 (20XX01、20XX04、20XX07、20XX10) */
const getAnimeSeason = (date = new Date()) => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1; // 1-12
	const seasonMonth = Math.floor((month - 1) / 3) * 3 + 1;
	return `${year}${seasonMonth.toString().padStart(2, "0")}`;
};

/** 获取上个季度 */
const getPrevAnimeSeason = (date = new Date()): string => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const currentSeasonMonth = Math.floor((month - 1) / 3) * 3 + 1;

	let prevYear = year;
	let prevSeasonMonth = currentSeasonMonth - 3;
	if (prevSeasonMonth < 1) {
		prevYear--;
		prevSeasonMonth = 10;
	}

	return `${prevYear}${prevSeasonMonth.toString().padStart(2, "0")}`;
};

/** 获取需要监听的活跃季度目录（本季 + 上季） */
const getActiveSeasonDirs = () => {
	const currentSeason = getAnimeSeason();
	const lastSeason = getPrevAnimeSeason();

	return [currentSeason, lastSeason].map((season) => `${ANIMES_DIR}/${season}`);
};

/**
 * 监听番剧改动，汇报给 SQLite 数据表
 * @remarks 启动时全量同步所有番剧，后续只监听本季和上季的
 */
export const watchAnimes = async () => {
	/**
	 * 一阶段：启动时全量同步所有历史番剧
	 */
	console.time("全量同步番剧");

	const initWatcher = chokidar.watch(ANIMES_DIR, {
		depth: 2,
		ignored: (path, stats) => {
			// 忽略非目录
			return stats?.isDirectory() === false;
		},
	});

	// 把所有番剧加入队列
	const initQueue: Array<{ path: string; stats?: fs.Stats }> = [];
	initWatcher.on("addDir", (path, stats) => {
		// 只收集番剧目录
		const relativePath = path.replaceAll("\\", "/").replace(ANIMES_DIR, "");
		const depth = getPathDepth(relativePath);
		if (depth === 2) {
			initQueue.push({ path, stats });
		}
	});

	// 批量处理队列，使用事务优化性能
	const batchAdd = db.transaction(async () => {
		await Promise.all(
			initQueue.map(({ path, stats }) => saveAnime(path, stats)),
		);
		return initQueue.length;
	});

	// 等待扫描完成
	await new Promise<void>((resolve) => {
		initWatcher.on("ready", async () => {
			await batchAdd();
			initWatcher.close();
			resolve();
		});
	});

	console.timeEnd("全量同步番剧");

	/**
	 * 二阶段：只监听最近两个季度的
	 */

	const activeDirs = getActiveSeasonDirs();
	log("开始监听目录", activeDirs);

	const activeWatcher = chokidar.watch(activeDirs, {
		depth: 1,
		ignored: (path, stats) => {
			// 忽略非目录
			return stats?.isDirectory() === false;
		},
		ignoreInitial: true,
		awaitWriteFinish: true,
	});

	activeWatcher
		.on("addDir", async (path, stats) => {
			const relativePath = path.replaceAll("\\", "/").replace(ANIMES_DIR, "");
			const depth = getPathDepth(relativePath);
			if (depth === 2) {
				saveAnime(path, stats);
			}
		})
		.on("change", async (path, stats) => {
			const relativePath = path.replaceAll("\\", "/").replace(ANIMES_DIR, "");
			const depth = getPathDepth(relativePath);
			if (depth === 2) {
				saveAnime(path, stats);
			}
		})
		.on("unlinkDir", (path) => {
			const relativePath = path.replaceAll("\\", "/").replace(ANIMES_DIR, "");
			const depth = getPathDepth(relativePath);
			if (depth === 2) {
				unlinkFile(path);
			}
		});
};
