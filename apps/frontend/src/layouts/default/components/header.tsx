import { throttle } from "@nickyzj2023/utils";
import { useEffect, useState } from "preact/hooks";
import toast from "react-hot-toast/headless";
import { useToggle } from "react-use";
import { Link, useRoute } from "wouter-preact";
import Avatar from "@/components/avatar";
import Button from "@/components/button";
import Toggle from "@/components/toggle";
import useUser from "@/hooks/store/use-user";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { routesWithIcon } from "@/utils/routes";
import { clsx } from "@/utils/string";

const Header = () => {
	// 滚动自动收起顶栏
	const [isHeaderVisible, toggleHeader] = useToggle(true);
	useEffect(() => {
		let prevScrollY = 0;

		const onScroll = throttle(() => {
			toggleHeader(window.scrollY < prevScrollY);
			prevScrollY = window.scrollY;
		}, 150);

		window.addEventListener("scroll", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	// 移动端点击打开菜单
	const isMobile = useIsMobile();
	const [isNavVisible, toggleNav] = useToggle(false);

	// 用户相关
	const [user] = useUser();
	const onClickMessage = () => {
		toast("消息模块开发中！");
	};
	const onClickUser = () => {
		toast("用户模块开发中！");
	};

	return (
		<header
			className={clsx(
				"bento sticky z-30 flex items-center justify-between py-2 transition-all",
				isHeaderVisible ? "top-0" : "-top-20",
			)}
		>
			{isMobile ? (
				<div className="relative z-10">
					<Toggle
						className="relative z-20"
						value={isNavVisible}
						onChange={toggleNav}
					/>
					{/* 全局遮罩 */}
					<div
						className={clsx(
							"fixed top-0 left-0 size-full backdrop-blur-sm backdrop-brightness-75 transition-all",
							!isNavVisible && "invisible opacity-0 pointer-events-none",
						)}
						onClick={toggleNav}
					/>
					{/* 路由菜单 */}
					<div
						className={clsx(
							"absolute left-0 flex flex-col gap-3 w-10 transition-all",
							isNavVisible
								? "top-16"
								: "top-0 invisible opacity-0 pointer-events-none",
						)}
					>
						{routesWithIcon.map(({ path, Icon }) => {
							// 对于首页，精准匹配
							// 对于其他页面，模糊匹配到子孙路由
							const [match] = useRoute(path === "/" ? "/" : `${path}/*?`);
							return (
								<Link key={path} href={path}>
									<Button
										variant={match ? "info" : "default"}
										size="xl"
										rounded="full"
										icon={Icon}
										onClick={toggleNav}
									/>
								</Link>
							);
						})}
					</div>
				</div>
			) : (
				<Link
					href="/"
					className="flex items-center gap-1.5 text-xl tracking-wide transition dark:text-neutral-100"
				>
					<img src="/favicon.webp" alt="logo" className="size-12" />
					NICKYZJ
				</Link>
			)}

			{/* 用户相关 */}
			<div className="flex items-center gap-6">
				<Button
					size="lg"
					rounded="full"
					icon={<i className="i-mingcute-notification-line" />}
					onClick={onClickMessage}
				/>
				<div className="divider" />
				<button
					className="flex items-center gap-1.5 dark:text-white"
					onClick={onClickUser}
				>
					{!isMobile && user.name}
					<Avatar size="xl" />
				</button>
			</div>
		</header>
	);
};

export default Header;
