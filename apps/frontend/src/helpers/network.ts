import { BACKEND_PORT, BASE_URL, WEBDAV_PORT } from "@/etc/constants";
import LRUCache from "@/etc/lru-cache";

const cachedRequests = new LRUCache<string, Promise<Response>>();

/**
 * 向 Amadeus 后端发送请求
 * @param path 接口路由，以“/”开头
 * @param options 请求选项，同 Fetch API 第二个参数，body 允许传递对象
 * @example
 * const res = await request<Resp>("/blogs/2025/猩猩也能懂的Node.js部署教程", {
 *     method: "PUT",
 *     body: {
 *         title: "Node.js部署教程",
 *         year: 2024,
 *     },
 * });
 */
export const request = async <T>(path: string, options: Recordable = {}) => {
    // 处理 body 为对象的情况
    if (typeof options.body === "object" && !(options.body instanceof FormData)) {
        options.body = JSON.stringify(options.body);
        options.headers = {
            ...options.headers,
            "Content-Type": "application/json",
        }
    }

    const fetcher = () => fetch(`${BASE_URL}:${BACKEND_PORT}${path}`, options);
    let promise: Promise<Response>;

    const canCache = !options.method || options.method === "GET";
    if (canCache) {
        if (!cachedRequests.has(path)) {
            cachedRequests.set(path, fetcher());
        }
        promise = cachedRequests.get(path);
    } else {
        promise = fetcher();
    }

    // 必须使用 clone() 消费一个新的响应体，否则下次从 cache 中获取的响应体会报错（无法被重复消费）
    const response = (await promise).clone();
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const data = await response.json();

    return data as T;
};

/**
 * Go 语言风格的异步处理方式
 * @example
 * const [error, response] = await to(request<Resp>("/blogs/2025/猩猩也能懂的Node.js部署教程"));
 */
export const to = async <T, U = Error>(promise: Promise<T>): Promise<[null, T] | [U, undefined]> => {
    try {
        const response = await promise;
        return [null, response];
    } catch (error) {
        return [error as U, undefined];
    }
};

/**
 * 获取 WebDav 图片地址
 * @param path 相对路径，以“/”开头
 * @example
 * const src = getImage("/Nickyzj/Photos/Blogs/猩猩也能懂的Node.js部署教程.webp");
 */
export const getImage = (path: string) => {
    return `${BASE_URL}:${WEBDAV_PORT}/p/Nickyzj/Photos${encodeURIComponent(path)}`;
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
    return `${BASE_URL}:${WEBDAV_PORT}/p/Nickyzj/Animes/${anime.season}/${encodeURIComponent(anime.title)}/${encodeURIComponent(episode)}`;
};
