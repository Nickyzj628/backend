// ------------ 通用工具类型

type Recordable = Record<string, any>;

// ------------ 消息通知

type Toast = {
	id: string;
	type: "success" | "info" | "warning" | "error";
	message: string;
	duration?: number;
	lifecycle?: "beforeEnter" | "entered" | "beforeExit";
};

// ------------ 通用请求

type Resp = {
	statusCode: number;
	message: string;
};

type RespWithpage = Resp & {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

// ------------ 用户相关

type User = {
	id: number;
	name: string;
};

// ------------ 每日一句

type Shanbay = {
	content: string;
	translation: string;
	author: string;
	image: string;
};

// ------------ 文章

type Blog = {
	title: string;
	slug: string;
	year: number;
	created_at: string;
	updated_at: string;
	html?: string;
};

type BlogsParams = {
	page?: number;
};

type BlogsResp = RespWithpage & {
	list: Blog[];
};

type BlogResp = Resp & Blog;

type BlogMutationBody = {
	title: string;
	year: number;
	/** base64 */
	cover?: string;
};

// ------------ 番剧

type Anime = {
	title: string;
	slug: string;
	season: string;
	eps: number;
	episodes?: string;
	created_at: string;
	updated_at: string;
};

type AnimesParams = {
	page?: number;
};

type AnimesResp = RespWithpage & {
	list: Anime[];
};

type AnimeResp = Resp & Anime;

type AnimeMutationBody = {
	title: string;
	season: string;
	/** base64 */
	cover?: string;
};

type RoomMessage = {
	type?: "user" | "host" | "system";
	userName: string;
	text: string;
};
