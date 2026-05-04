import { useEffect, useMemo } from "preact/hooks";
import NotFound from "@/pages/not-found";
import { routes, useRouterStore } from "@/stores/router";
import { setTitle } from "@/utils/dom";

const Router = () => {
	const router = useRouterStore();

	// 用 router.route 反向匹配 routes[number]
	const route = useMemo(() => {
		if (!router) {
			return null;
		}
		return routes.find((route) => route.path === router.route);
	}, [router]);

	// 自动更新页面标题
	useEffect(() => {
		if (!route || !("title" in route)) {
			return;
		}
		setTitle(route.title);
	}, [route]);

	const { Component } = route ?? {};
	if (!Component) {
		return <NotFound />;
	}
	return <Component />;
};

export default Router;
