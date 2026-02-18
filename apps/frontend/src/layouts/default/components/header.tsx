import { throttle } from "@nickyzj2023/utils";
import { useEffect, useState } from "preact/hooks";
import toast from "react-hot-toast/headless";
import { Link, useRoute } from "wouter-preact";
import Avatar from "@/components/avatar";
import Button from "@/components/button";
import Toggle from "@/components/toggle";
import { ROUTES_VISIBLE_AT_NAVBAR, routes } from "@/etc/routes";
import { clsx } from "@/helpers/string";
import { useIsMobile } from "@/hooks/device";
import useUser from "@/hooks/store/use-user";

const Header = () => {
	/**
	 * 滚动自动收起顶栏
	 */

	const [isHeaderVisible, setIsHeaderVisible] = useState(false);
	useEffect(() => {
		let prevScrollY = 0;

		const onScroll = throttle(() => {
			setIsHeaderVisible(window.scrollY < prevScrollY);
			prevScrollY = window.scrollY;
		}, 150);
		window.addEventListener("scroll", onScroll);

		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	/**
	 * 移动端点击打开菜单
	 */

	const isMobile = useIsMobile();
	const [isNavVisible, setIsNavVisible] = useState(false);

	/**
	 * 用户相关
	 */

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
			{/* logo@pc */}
			{!isMobile && (
				<Link
					href="/"
					className="flex items-center gap-1.5 text-xl tracking-wide transition dark:text-neutral-100"
				>
					<img src="/favicon.webp" alt="LOGO" className="size-12" />
					NICKYZJ
				</Link>
			)}
			{/* nav@mobile */}
			{isMobile && (
				<div className="relative z-10">
					{/* trigger */}
					<Toggle
						value={isNavVisible}
						className="relative z-20"
						onChange={setIsNavVisible}
					/>
					{/* global shade */}
					<div
						className={clsx(
							"fixed top-0 left-0 size-full backdrop-blur-sm backdrop-brightness-75 transition-all",
							!isNavVisible && "invisible opacity-0 pointer-events-none",
						)}
						onClick={() => setIsNavVisible(false)}
					/>
					{/* routes list */}
					<div
						className={clsx(
							"absolute left-0 flex flex-col gap-3 w-10 transition-all",
							isNavVisible
								? "top-16"
								: "invisible opacity-0 top-0 pointer-events-none",
						)}
					>
						{routes
							.filter(
								(route) =>
									ROUTES_VISIBLE_AT_NAVBAR.includes(route.path) &&
									route.accessible,
							)
							.map((route) => {
								const [match] = useRoute(
									route.path === "/" ? "/" : `${route.path}/*?`,
								);

								return (
									<Link
										key={route.path}
										href={route.path}
										onClick={() => setIsNavVisible(false)}
									>
										<Button
											type={match ? "info" : "default"}
											size="xl"
											rounded="full"
											icon={route.icon}
										/>
									</Link>
								);
							})}
					</div>
				</div>
			)}
			{/* user */}
			<div className="flex items-center gap-6">
				<Button
					size="lg"
					rounded="full"
					icon="icon-[mingcute--notification-line]"
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
