import { useEffect, useState } from "preact/hooks";
import { useLocalStorage } from "react-use";
import { Link, useRoute } from "wouter-preact";
import Button from "@/components/button";
import { ROUTES_VISIBLE_AT_NAVBAR, routes } from "@/etc/routes";
import { clsx } from "@/helpers/string";
import { useIsMobile } from "@/hooks/device";

const Aside = () => {
	const isMobile = useIsMobile();

	// 手动切换侧边栏
	const [isAsideFold, setIsAsideFold] = useLocalStorage("isAsideFold", false);

	// 手动切换深色模式
	const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";
	const [isDark, setIsDark] = useState(
		window.matchMedia(DARK_MEDIA_QUERY).matches,
	);
	useEffect(() => {
		document.documentElement.className = isDark ? "dark" : "";
	}, [isDark]);

	// 自动切换深色模式
	useEffect(() => {
		window.matchMedia(DARK_MEDIA_QUERY).onchange = (e) => {
			setIsDark(e.matches);
		};
	}, []);

	if (isMobile) {
		return null;
	}

	return (
		<aside
			className={clsx(
				"bento flex flex-col justify-between w-18 rounded-xl transition-all",
				isAsideFold ? "items-center" : "lg:w-36 xl:w-44",
			)}
		>
			{/* routes */}
			<nav
				className={clsx(
					"sticky top-3 flex flex-col gap-2 w-full",
					!isAsideFold && "lg:gap-3",
				)}
			>
				{routes
					.filter(
						(route) =>
							ROUTES_VISIBLE_AT_NAVBAR.includes(route.path) && route.accessible,
					)
					.map((route) => {
						const [match] = useRoute(
							route.path === "/" ? "/" : `${route.path}/*?`,
						);
						return (
							<Link href={route.path} key={route.path}>
								<Button
									type={match ? "info" : "ghost"}
									size="xl"
									rounded={isAsideFold ? "full" : true}
									icon={clsx(route.icon, "shrink-0")}
									className={clsx("w-full px-3! whitespace-nowrap")}
								>
									{!isAsideFold && !isMobile && route.title}
								</Button>
							</Link>
						);
					})}
			</nav>
			{/* gadgets */}
			<div
				className={clsx(
					"sticky bottom-3 flex flex-wrap gap-3 w-full",
					isAsideFold && "justify-center",
				)}
			>
				{!isMobile && (
					<Button
						type={isAsideFold ? "ghost" : "info"}
						size="xl"
						rounded="full"
						icon="icon-[mingcute--align-arrow-left-line]"
						className={clsx(isAsideFold && "rotate-180")}
						onClick={() => setIsAsideFold(!isAsideFold)}
					/>
				)}
				<Button
					type={isDark ? "info" : "ghost"}
					size="xl"
					rounded="full"
					icon={
						isDark ? "icon-[mingcute--sun-line]" : "icon-[mingcute--moon-line]"
					}
					onClick={() => setIsDark(!isDark)}
				/>
			</div>
		</aside>
	);
};

export default Aside;
