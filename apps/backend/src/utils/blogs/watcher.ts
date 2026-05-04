import type { Stats } from "node:fs";
import { log } from "@nickyzj2023/utils";
import chokidar from "chokidar";
import { BLOGS_DIR } from "@/utils/constants";
import { deleteBlog, saveBlog } from "./sql";

/**
 * 监听文章改动，汇报给 SQLite 数据表
 * @remarks 启动时全量同步所有文章，后续只监听今年和去年的
 */
export const watchBlogs = async () => {
	/**
	 * 一阶段：启动时全量同步所有历史文件
	 */

	const initWatcher = chokidar.watch(BLOGS_DIR, {
		depth: 1,
		ignored: (path, stats) => {
			// 忽略非 .md 文件
			return stats?.isFile() === true && !path.endsWith(".md");
		},
	});

	// 把所有文章加入队列
	const initQueue: Array<{ path: string; stats?: Stats }> = [];
	initWatcher.on("add", (path, stats) => {
		initQueue.push({ path, stats });
	});

	// 批量处理队列
	await new Promise<void>((resolve) => {
		initWatcher.on("ready", async () => {
			await Promise.all(
				initQueue.map(({ path, stats }) => saveBlog(path, stats)),
			);
			initWatcher.close();
			resolve();
		});
	});

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
		ignoreInitial: true,
		awaitWriteFinish: true,
	});

	activeWatcher
		.on("add", saveBlog)
		.on("change", saveBlog)
		.on("unlink", deleteBlog)
		.on("ready", () => {
			log(`开始监听目录：${activeDirs.join("、")}`);
		});
};
