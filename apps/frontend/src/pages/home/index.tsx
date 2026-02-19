import useUser from "@/hooks/store/use-user";
import { getPeriod } from "@/utils/time";
import RecentAnimes from "./components/recent-animes";
import RecentBlogs from "./components/recent-blogs";
import Shanbay from "./components/shanbay";

const Page = () => {
	const [user] = useUser();

	return (
		<>
			<div className="w-full">
				<h4 className="text-neutral-500 dark:text-neutral-400">
					{getPeriod()}好，欢迎回来：
				</h4>
				<h1>{user.name}</h1>
			</div>
			<Shanbay />
			<RecentBlogs />
			<RecentAnimes />
		</>
	);
};

export default Page;
