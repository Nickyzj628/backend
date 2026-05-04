import { useEffect } from "preact/hooks";
import Button from "@/components/button";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { usePreferenceStore } from "@/stores/preference";
import { routesWithIcon, useRouterStore } from "@/stores/router";
import { clsx } from "@/utils/string";

const Aside = () => {
	const isMobile = useIsMobile();

	const {
		data: { aside, theme },
		setKey: setPreferenceKey,
	} = usePreferenceStore();

	const isAsideFolded = aside === "folded";
	const isDark = theme === "dark";

	/**
	 * 深色模式
	 */

	useEffect(() => {
		const { documentElement } = document;
		if (!isDark) {
			documentElement.className = documentElement.className.replace("dark", "");
		} else {
			documentElement.className += "dark";
		}
	}, [isDark]);

	// 根据系统偏好自动切换
	useEffect(() => {
		const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = (e: MediaQueryListEvent) => {
			setPreferenceKey("theme", e.matches ? "dark" : "light");
		};

		colorSchemeQuery.addEventListener("change", onChange);

		return () => {
			colorSchemeQuery.removeEventListener("change", onChange);
		};
	}, [setPreferenceKey]);

	if (isMobile) {
		return null;
	}

	return (
		<aside
			className={clsx(
				"bento flex flex-col justify-between w-17 rounded-xl transition-all",
				isAsideFolded ? "items-center" : "lg:w-36 xl:w-44",
			)}
		>
			{/* 路由菜单 */}
			<nav
				className={clsx(
					"sticky top-3 flex flex-col gap-2 w-full",
					!isAsideFolded && "lg:gap-3",
				)}
			>
				{routesWithIcon.map(({ path, title, Icon, ...restProps }) => {
					const router = useRouterStore();
					const isMatched =
						"exact" in restProps && restProps.exact
							? router?.route === path
							: router?.route.includes(path);
					return (
						<a key={path} href={path}>
							<Button
								variant={isMatched ? "info" : "ghost"}
								size="xl"
								rounded={isAsideFolded ? "full" : true}
								icon={Icon}
								className={clsx("w-full px-3! whitespace-nowrap")}
							>
								{!isAsideFolded && title}
							</Button>
						</a>
					);
				})}
			</nav>
			{/* 底部小工具 */}
			<div
				className={clsx(
					"sticky bottom-3 flex flex-wrap gap-3 w-full",
					isAsideFolded && "justify-center",
				)}
			>
				{!isMobile && (
					<Button
						variant={isAsideFolded ? "ghost" : "info"}
						size="xl"
						rounded="full"
						icon={<i className="i-mingcute-align-arrow-left-line" />}
						className={clsx(isAsideFolded && "rotate-180")}
						onClick={() => {
							setPreferenceKey("aside", !isAsideFolded ? "folded" : "full");
						}}
					/>
				)}
				<Button
					variant={isDark ? "info" : "ghost"}
					size="xl"
					rounded="full"
					icon={
						<i
							className={
								isDark ? "i-mingcute-sun-line" : "i-mingcute-moon-line"
							}
						/>
					}
					onClick={() => {
						setPreferenceKey("theme", isDark ? "light" : "dark");
					}}
				/>
			</div>
		</aside>
	);
};

export default Aside;
