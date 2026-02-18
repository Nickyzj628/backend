import { useEffect, useState } from "preact/hooks";
import { useParams } from "wouter-preact";
import Loading from "@/components/loading";
import Tabs from "@/components/tabs";
import { SocketProvider } from "@/etc/socket-context";
import { setTitle } from "@/helpers/dom";
import { useAnime } from "@/hooks/store/use-anime";
import Episodes from "@/pages/anime/episodes";
import Room from "@/pages/anime/room";
import Video from "@/pages/anime/video";
import NotFound from "@/pages/not-found";

const Tab = {
	Episodes: 1,
	Room: 2,
	Comments: 3,
} as const;

type Params = {
	slug: string;
};

const Page = () => {
	const { slug } = useParams<Params>();

	const tabContentClassName =
		"flex flex-col gap-1.5 p-3 rounded-xl bg-neutral-100 overflow-y-auto transition dark:bg-neutral-700";

	// 获取番剧详情
	const { data, error, isLoading } = useAnime(slug);
	useEffect(() => {
		if (data && "title" in data) {
			setTitle(data.title);
		}
	}, [data]);

	/**
	 * 房间相关状态
	 */

	const [isHost, setIsHost] = useState(true);

	if (isLoading)
		return (
			<div className="absolute inset-0 m-auto flex flex-col items-center gap-1 size-fit text-neutral-400 transition dark:text-neutral-500">
				<Loading />
			</div>
		);

	if (error) return <NotFound />;

	return (
		<SocketProvider config={{ path: "/rooms" }}>
			<Video anime={data} isHost={isHost} />
			<Tabs
				defaultValue={Tab.Episodes}
				className="w-full xl:w-64 max-h-96 overflow-hidden"
			>
				<Tabs.List>
					<Tabs.Trigger value={Tab.Episodes}>选集</Tabs.Trigger>
					<Tabs.Trigger value={Tab.Room}>聊天</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value={Tab.Episodes} className={tabContentClassName}>
					<Episodes list={data?.episodes} disabled={!isHost} />
				</Tabs.Content>
				<Tabs.Content value={Tab.Room} className={tabContentClassName}>
					<Room isHost={isHost} onChangeHost={setIsHost} />
				</Tabs.Content>
			</Tabs>
		</SocketProvider>
	);
};

export default Page;
