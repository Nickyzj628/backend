import { ANIMES_DIR } from "../constants";

export * from "./sql";
export * from "./watcher";

/** 计算相对路径的深度 */
export const getPathDepth = (relativePath: string) => {
	return relativePath.split(/[\\/]/).filter(Boolean).length;
};

/** 获取当前番剧季度 (20XX01、20XX04、20XX07、20XX10) */
export const getAnimeSeason = (date = new Date()) => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1; // 1-12
	const seasonMonth = Math.floor((month - 1) / 3) * 3 + 1;
	return `${year}${seasonMonth.toString().padStart(2, "0")}`;
};

/** 获取上个季度 */
export const getPrevAnimeSeason = (date = new Date()): string => {
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
export const getActiveSeasonDirs = () => {
	const currentSeason = getAnimeSeason();
	const lastSeason = getPrevAnimeSeason();

	return [currentSeason, lastSeason].map((season) => `${ANIMES_DIR}/${season}`);
};
