import { useEffect } from "preact/hooks";
import { useLocation } from "react-use";
import { routes } from "@/etc/routes";
import { setTitle } from "@/helpers/dom";

/** 切换页面时自动更新标签页标题 */
const TitleUpdater = () => {
	const { pathname } = useLocation();

	useEffect(() => {
		const route = routes.find((route) => route.path === pathname);
		if (route && "title" in route) {
			setTitle(route.title);
		}
	}, [pathname]);

	return null;
};

export default TitleUpdater;
