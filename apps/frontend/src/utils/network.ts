import type { Anime } from "@nickyzj2023/shared-types";
import { BASE_URL, WEBDAV_PORT } from "@/utils/constants";

/**
 * 获取 WebDav 图片地址
 * @param path 相对路径，以“/”开头
 * @example
 * const src = getImage("/Nickyzj/Photos/Blogs/猩猩也能懂的Node.js部署教程.webp");
 */
export const getImage = (path: string) => {
	return `${BASE_URL}:${WEBDAV_PORT}/Nickyzj/Photos${encodeURIComponent(path)}`;
};

/**
 * 从 WebDav 获取番剧单集视频地址
 * @example
 * const src = getAnimeVideoByEp({
 *     season: "202507",
 *     title: "NUKITASHI",
 *     episodes: ["1.mp4", "2.mp4"],
 * }, 2);
 */
export const getAnimeVideoByEp = (anime: Anime, ep = 1) => {
	const episode = anime.episodes[ep - 1];
	if (!episode) {
		return "";
	}
	return `${BASE_URL}:${WEBDAV_PORT}/Nickyzj/Animes/${anime.season}/${encodeURIComponent(anime.title)}/${encodeURIComponent(episode)}`;
};
