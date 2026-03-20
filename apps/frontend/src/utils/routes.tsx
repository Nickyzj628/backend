import { lazy, type ReactNode } from "preact/compat";

export type Route = {
  path: string;
  title?: string;
  Icon?: ReactNode;
  Component: () => ReactNode;
};

export const routes = [
  {
    path: "/",
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
];

export const routesWithIcon = routes.filter((route) => "Icon" in route);

export const nanostoresRoutes = routes
  .map((route) => route.path)
  .reduce((acc, path) => {
    acc[path] = path;
    return acc;
  }, {});
