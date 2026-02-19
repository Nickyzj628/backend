import { lazy, type ReactNode } from "preact/compat";

export type Route = {
	path: string;
	title?: string;
	icon?: ReactNode;
	component: () => ReactNode;
};

export const routes: Route[] = [
	{
		path: "/",
		title: "主页",
		icon: <div className="i-mingcute-home-3-line" />,
		component: lazy(() => import("@/pages/home")),
	},
	{
		path: "/blogs",
		title: "文章",
		icon: <div className="i-mingcute-book-6-line" />,
		component: lazy(() => import("@/pages/blogs")),
	},
	{
		path: "/blogs/:slug",
		component: lazy(() => import("@/pages/blogs/[slug]")),
	},
	{
		path: "/animes",
		title: "番剧",
		icon: <div className="i-mingcute-tv-2-line" />,
		component: lazy(() => import("@/pages/animes")),
	},
	{
		path: "/animes/:slug",
		component: lazy(() => import("@/pages/animes/[slug]")),
	},
	{
		path: "/about",
		title: "关于",
		icon: <div className="i-mingcute-user-3-line" />,
		component: lazy(() => import("@/pages/about")),
	},
];

export const routesWithIcon = routes.filter((route) => "icon" in route);
