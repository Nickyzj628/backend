import { useEffect } from "preact/hooks";
import { useLocation } from "react-use";
import { setTitle } from "@/utils/dom";
import { routes } from "@/utils/routes";

/** 切换页面时自动更新标签页标题 */
const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const route = routes.find((route) => route.path === location.pathname);
    if (route && "title" in route) {
      setTitle(route.title);
    }
  }, [location]);

  return null;
};

export default TitleUpdater;
