import { useStore } from "@nanostores/preact";
import { createRouter, openPage, redirectPage } from "@nanostores/router";
import { lazy } from "preact/compat";
import type { Recordable } from "@/types/common";

export const routes = [
  {
    path: "/",
    exact: true,
    title: "主页",
    Icon: <i className="i-mingcute-home-3-line" />,
    Component: lazy(() => import("@/pages/home")),
  },
  {
    path: "/blogs",
    title: "文章",
    Icon: <i className="i-mingcute-book-6-line" />,
    Component: lazy(() => import("@/pages/blogs")),
  },
  {
    path: "/blogs/:slug",
    Component: lazy(() => import("@/pages/blogs/[slug]")),
  },
  {
    path: "/animes",
    title: "番剧",
    Icon: <i className="i-mingcute-tv-2-line" />,
    Component: lazy(() => import("@/pages/animes")),
  },
  {
    path: "/animes/:slug",
    Component: lazy(() => import("@/pages/animes/[slug]")),
  },
  {
    path: "/about",
    title: "关于",
    Icon: <i className="i-mingcute-user-3-line" />,
    Component: lazy(() => import("@/pages/about")),
  },
] as const;

export const routesWithIcon = routes.filter((route) => "Icon" in route);

type RoutePath = (typeof routes)[number]["path"];

const pathObj = Object.fromEntries(routes.map((route) => [route.path, route.path])) as {
  [K in RoutePath]: K;
};

const routerStore = createRouter(pathObj);

/**
 * 等同于 useStore(routerStore)
 * @example
 * const { route, params, search } = useRouterStore();
 * if (route === "/blogs/:slug") {
 *   console.log(params.slug);
 * }
 */
export const useRouterStore = () => useStore(routerStore);

export type UseRouterStore = ReturnType<typeof useRouterStore>;

/**
 * 页面导航函数封装，基于 @nanostores/router 的 openPage/redirectPage
 * @example
 * const navigate = useNavigate();
 * navigate("/animes/:slug", {
 *  params: { slug: "wu-zhi-zhuan-sheng" },
 *  search: { ep: 10 },
 *  replace: true,
 * });
 */
export const useNavigate = () => {
  const router = useRouterStore();

  return (
    route: RoutePath,
    options?: {
      params?: Recordable;
      search?: Recordable;
      /** 是否原地跳转 */
      replace?: boolean;
    },
  ) => {
    const { params = router.params, search = router.search, replace = false } = options ?? {};

    const fn = replace ? redirectPage : openPage;
    return fn(routerStore, route, params, search);
  };
};
