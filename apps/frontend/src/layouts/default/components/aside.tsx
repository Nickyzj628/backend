import { useEffect, useState } from "preact/hooks";
import { useLocalStorage, useMedia, useToggle } from "react-use";
import { Link, useRoute } from "wouter-preact";
import Button from "@/components/button";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { routesWithIcon } from "@/utils/routes";
import { clsx } from "@/utils/string";

const Aside = () => {
	const isMobile = useIsMobile();

	// 手动切换侧边栏
	const [isAsideFold, setIsAsideFold] = useLocalStorage("isAsideFold", false);

	/**
	 * 深色模式
	 */

	const [isDark, toggleDark] = useToggle(false);
	useEffect(() => {
		const { documentElement } = document;
		if (!isDark) {
			documentElement.className = documentElement.className.replace("dark", "");
		} else {
			documentElement.className += "dark";
		}
	}, [isDark]);

	// 根据系统偏好自动切换
	const isSystemDark = useMedia("(prefers-color-scheme: dark)");
	useEffect(() => {
		toggleDark(isSystemDark);
	}, [isSystemDark]);

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
			{/* 路由菜单 */}
			<nav
				className={clsx(
					"sticky top-3 flex flex-col gap-2 w-full",
					!isAsideFold && "lg:gap-3",
				)}
			>
				{routesWithIcon.map(({ path, title, Icon }) => {
					const [match] = useRoute(path === "/" ? "/" : `${path}/*?`);
					return (
						<Link key={path} href={path}>
							<Button
								variant={match ? "info" : "ghost"}
								size="xl"
								rounded={isAsideFold ? "full" : true}
								icon={Icon}
								className={clsx("w-full px-3! whitespace-nowrap")}
							>
								{!isAsideFold && title}
							</Button>
						</Link>
					);
				})}
			</nav>
			{/* 底部小工具 */}
			<div
				className={clsx(
					"sticky bottom-3 flex flex-wrap gap-3 w-full",
					isAsideFold && "justify-center",
				)}
			>
				{!isMobile && (
					<Button
						variant={isAsideFold ? "ghost" : "info"}
						size="xl"
						rounded="full"
						icon={<i className="i-mingcute-align-arrow-left-line" />}
						className={clsx(isAsideFold && "rotate-180")}
						onClick={() => setIsAsideFold(!isAsideFold)}
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
					onClick={toggleDark}
				/>
			</div>
		</aside>
	);
};

export default Aside;
