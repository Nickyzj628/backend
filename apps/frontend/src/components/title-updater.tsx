import { useEffect } from "preact/hooks";
import { useLocation } from "wouter-preact";
import { routes } from "@/etc/routes";
import { setTitle } from "@/helpers/dom";

/** 切换页面时自动更新标签页标题 */
const TitleUpdater = () => {
	const [location] = useLocation();
	useEffect(() => {
		const route = routes.find((route) => route.path === location);
		if (route && "title" in route) {
			setTitle(route.title);
		}
	}, [location]);

	return null;
};

export default TitleUpdater;
