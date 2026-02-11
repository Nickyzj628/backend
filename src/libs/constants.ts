/** 项目根目录绝对路径 */
export const ROOT_PATH = process.cwd();

/** 服务器端口号 */
export const PORT = 3030;

/** 允许访问本后端的源地址 */
export const ALLOWED_ORIGINS = [
	"http://localhost:5173",
	"https://localhost:2334",
	"https://nickyzj.run:2334",
];

/** 每页数据个数 */
export const DEFAULT_PAGE_SIZE = 10;

/** WebDav 服务器地址 */
export const WEBDAV_URL = "https://nickyzj.run:2020";
/** WebDav 服务器本地路径 */
export const WEBDAV_PATH = "E:/Storage";
/** WebDav 本地文章目录 */
export const BLOGS_DIR = `${WEBDAV_PATH}/Nickyzj/Blogs`;
/** WebDav 本地番剧目录 */
export const ANIMES_DIR = `${WEBDAV_PATH}/Nickyzj/Animes`;
