import type { Stats } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, relative } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { log } from "@nickyzj2023/utils";
import type { AnimeItem } from "@/types/animes";
import { extractSeasonFromPath, textToSlug } from "../common";
import { ROOT_PATH, WEBDAV_PATH } from "../constants";

const db = new DatabaseSync(`${ROOT_PATH}/data/sqlite.db`);

db.exec(`
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

const saveStmt = db.prepare(`
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

const deleteStmt = db.prepare(`
  DELETE FROM animes WHERE title = $title
`);

/** @remarks 列表查询不返回 episodes 字段，避免数据过大 */
export const listStmt = db.prepare(`
  SELECT title, slug, season, eps, created_at, updated_at
  FROM animes
  ORDER BY updated_at DESC
  LIMIT $limit OFFSET $offset
`);

export const countStmt = db.prepare(`SELECT COUNT(*) as total FROM animes`);

export const getBySlugStmt = db.prepare(`
  SELECT *
  FROM animes
  WHERE slug = $slug
`);

export const saveAnime = async (path: string, stats?: Stats) => {
	const title = basename(path);
	const slug = textToSlug(title);
	const filePath = relative(WEBDAV_PATH, path);
	const season = extractSeasonFromPath(filePath);
	const episodesRaw = await readdir(path);
	const episodes = JSON.stringify(episodesRaw);
	const eps = episodesRaw.length;
	const createdAt = stats?.birthtime?.toISOString() ?? "";
	const updatedAt = stats?.mtime?.toISOString() ?? "";

	// 检查番剧是否存在
	const existing = getBySlugStmt.get({ $slug: slug }) as AnimeItem | undefined;

	// 如果不存在，则插入新记录
	if (!existing) {
		saveStmt.run({
			$title: title,
			$slug: slug,
			$season: season,
			$eps: eps,
			$episodes: episodes,
			$created_at: createdAt,
			$updated_at: updatedAt,
		});
		log(`新增番剧：${title}，共${eps}话`);
		return;
	}

	// 如果存在，则检查是否有变化
	const hasChanged =
		existing.season !== season ||
		existing.eps !== eps ||
		existing.episodes !== episodes ||
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
		$episodes: episodes,
		$created_at: createdAt,
		$updated_at: updatedAt,
	});
	log(`更新番剧：${title}，共${eps}话`);
};

export const removeAnime = (path: string) => {
	const title = basename(path);

	const result = deleteStmt.run({ $title: title }) as { changes: number };
	if (result.changes > 0) {
		log(`删除番剧：${title}`);
	}

	return result.changes;
};
