import dayjs from "dayjs";
import type { FC } from "preact/compat";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useHash } from "react-use";
import Button from "@/components/button";
import Loading from "@/components/loading";
import Toggle from "@/components/toggle";
import { useEnsuredRef, useZoom } from "@/hooks/dom";
import { useBlog } from "@/hooks/store/use-blog";
import NotFound from "@/pages/not-found";
import { setTitle } from "@/utils/dom";
import { getImage } from "@/utils/network";
import { clsx } from "@/utils/string";

type Params = {
	slug: string;
};

const Page: FC<Params> = ({ slug }) => {
	const [hash] = useHash();

	const { isLoading, error, data } = useBlog(slug);
	useEffect(() => {
		if (data && "title" in data) {
			setTitle(data.title);
		}
	}, [data]);

	// 生成目录
	const [isCatalogVisible, setIsCatalogVisible] = useState(
		window.innerWidth > 1152,
	);
	const catalog = useMemo(() => {
		if (!data?.html) {
			return [];
		}

		const headerElements = data.html.match(/<h\d id="[^"]+">.*?<\/h\d>/g);
		const headers = headerElements.map((element, index) => {
			const levelMatch = element.match(/<h(\d)/);
			const idMatch = element.match(/id="([^"]+)"/);
			const textMatch = element.match(/>([^<]+)<\/h\d>/);
			return {
				element,
				level: Number(levelMatch[1]),
				id: idMatch[1],
				text: textMatch[1],
			};
		});

		if (!headers.length) {
			return [];
		}

		const baseLevel = Math.min(...headers.map((header) => header.level));
		return headers.map(({ level, id, text }, i) => ({
			id,
			text,
			style: { marginLeft: (level - baseLevel) * 12 },
		}));
	}, [data]);

	// 锚点跳转
	useEffect(() => {
		if (isLoading || !hash) {
			return;
		}

		const a = document.getElementById(
			decodeURIComponent(hash).replace("#", ""),
		);
		a?.scrollIntoView();
	}, [isLoading, hash]);

	// 图片缩放
	const [initArticleRef, articleRef] = useEnsuredRef();
	useZoom(articleRef);

	if (isLoading)
		return (
			<div className="absolute inset-0 m-auto flex flex-col items-center gap-1 size-fit text-neutral-400 transition dark:text-neutral-500">
				<Loading />
			</div>
		);

	if (error) return <NotFound />;

	return (
		<>
			{/* banner */}
			<div
				className="absolute top-0 left-0 w-full aspect-square sm:aspect-18/9 lg:aspect-21/9 xl:aspect-32/9 rounded-xl bg-cover bg-center bg-no-repeat bg-fixed overflow-hidden"
				style={{
					backgroundImage: `url(${getImage(`/Blogs/${data.title}.webp`)})`,
				}}
			>
				<div className="absolute top-0 left-0 size-full rounded-xl backdrop-blur-sm backdrop-brightness-50" />
			</div>
			<div className="relative flex flex-col items-center gap-0.5 w-full mt-8 sm:mt-16 mb-4 sm:mb-8 p-3">
				<h1 className="mb-3 text-white text-balance text-center">
					{data.title}
				</h1>
				<span className="text-sm text-neutral-200">
					创建于：{dayjs(data.created_at).format("YYYY年MM月DD日 HH:mm:ss")}
				</span>
				<span className="text-sm text-neutral-200">
					最后更新于：{dayjs(data.updated_at).format("YYYY年MM月DD日 HH:mm:ss")}
				</span>
			</div>

			{/* article */}
			<article
				ref={initArticleRef}
				className="relative prose prose-neutral prose-img:inline prose-img:max-h-96 prose-img:mr-3 prose-img:mt-0 prose-img:mb-3 prose-img:shadow prose-img:rounded-xl prose-pre:rounded-xl px-6 mx-auto rounded-xl shadow-xl bg-white overflow-x-hidden transition dark:prose-invert prose-blockquote:dark:border-s-neutral-500 prose-pre:dark:bg-neutral-900 dark:bg-neutral-800"
				dangerouslySetInnerHTML={{ __html: data.html ?? "" }}
			/>

			{/* gadgets */}
			<div className="fixed bottom-3 right-6 flex flex-col items-end gap-3">
				{/* catalog */}
				<div
					className={clsx(
						"flex flex-col gap-2 w-48 max-h-96 p-3 rounded-xl shadow-lg bg-white overflow-x-hidden overflow-y-auto transition-all dark:bg-neutral-700",
						!isCatalogVisible && "invisible opacity-0",
					)}
				>
					{catalog.map((header, index) => {
						const isHeadline = header.style.marginLeft === 0;
						return (
							<a
								key={`${header.id}-${index}`}
								href={`#${header.id}`}
								style={header.style}
								className={clsx(
									"relative block shrink-0 truncate text-sm text-neutral-500 transition duration-150 hover:duration-0 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100",
									isHeadline &&
										"pl-3 before:absolute before:top-0 before:bottom-0 before:left-0 before:my-auto before:w-1 before:h-4 before:rounded-full before:bg-current",
								)}
							>
								{header.text}
							</a>
						);
					})}
				</div>
				<Toggle value={isCatalogVisible} onChange={setIsCatalogVisible} />
				{/* back top */}
				<Button
					size="xl"
					rounded="full"
					icon={<i className="i-mingcute-align-arrow-left-line rotate-90" />}
					onClick={() => window.scrollTo(0, 0)}
				/>
			</div>
		</>
	);
};

export default Page;
