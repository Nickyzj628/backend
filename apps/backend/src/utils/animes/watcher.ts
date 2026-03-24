import type { Stats } from "node:fs";
import { log } from "@nickyzj2023/utils";
import chokidar from "chokidar";
import { ANIMES_DIR } from "../constants";
import {
  getActiveSeasonDirs,
  getAnimeDir,
  getPathDepth,
  getRelativePath,
} from ".";
import { removeAnime, saveAnime } from "./sql";

/**
 * 监听番剧改动，汇报给 SQLite 数据表
 * @remarks 启动时全量同步所有番剧，后续只监听本季和上季的
 */
export const watchAnimes = async () => {
  /**
   * 一阶段：启动时全量同步所有历史番剧
   */

  const initWatcher = chokidar.watch(ANIMES_DIR, {
    depth: 2,
    ignored: (path, stats) => {
      // 忽略非目录
      return stats?.isDirectory() === false;
    },
  });

  // 把所有番剧加入队列
  const initQueue: Array<{ path: string; stats?: Stats }> = [];
  initWatcher.on("addDir", (path, stats) => {
    // 只收集番剧目录
    if (getPathDepth(getRelativePath(path)) === 2) {
      initQueue.push({ path, stats });
    }
  });

  // 批量处理队列
  await new Promise<void>((resolve) => {
    initWatcher.on("ready", async () => {
      await Promise.all(
        initQueue.map(({ path, stats }) => saveAnime(path, stats)),
      );
      initWatcher.close();
      resolve();
    });
  });

  /**
   * 二阶段：只监听最近两个季度的
   */

  const activeDirs = getActiveSeasonDirs();
  log(`开始监听目录：${activeDirs.join("、")}`);

  const activeWatcher = chokidar.watch(activeDirs, {
    depth: 2,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  activeWatcher
    .on("addDir", async (path, stats) => {
      if (getPathDepth(getRelativePath(path)) === 2) {
        saveAnime(path, stats);
      }
    })
    .on("add", async (path, stats) => {
      const animeDir = getAnimeDir(path);
      if (animeDir) saveAnime(animeDir, stats);
    })
    .on("unlink", async (path) => {
      const animeDir = getAnimeDir(path);
      if (animeDir) saveAnime(animeDir);
    })
    .on("unlinkDir", (path) => {
      if (getPathDepth(getRelativePath(path)) === 2) {
        removeAnime(path);
      }
    });
};
