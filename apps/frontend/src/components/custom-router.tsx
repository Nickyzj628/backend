import { useRoute } from "wouter-preact";
import type { Recordable } from "@/types/common";
import { routes } from "@/utils/routes";

/**
 * 基于 wouter Routing Hooks 实现的路由匹配组件
 *
 * 特点：
 * 1. 可以直接在页面对应组件 props 中拿到 params
 */
const CustomRouter = () => {
	return routes.map(({ path, Component }) => {
		const [match, params] = useRoute(path);
		if (!match) {
			return null;
		}
		return <Component {...(params as Recordable)} />;
	});
};

export default CustomRouter;
