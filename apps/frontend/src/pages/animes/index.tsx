import type { Anime } from "@nickyzj/shared-types";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Figcaption, Figure } from "@/components/figure";
import Section from "@/components/section";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useAnimesStore } from "@/stores/anime";
import { clsx } from "@/utils/string";
import { fromNow } from "@/utils/time";

type OnPageLoaded = (pageItems: Anime[], hasNextPage: boolean) => void;

const SeasonItems = ({
	page = 1,
	onLoaded,
	items = [],
}: {
	page: number;
	onLoaded: OnPageLoaded;
	items?: Anime[];
}) => {
	const isFirstPage = page === 1;

	const { loading, error, data } = useAnimesStore({ page });
	const { list = [], totalPages } = data ?? {};

	const season = Number(items[0]?.season);
	const colors = [
		"text-blue-300",
		"text-red-300",
		"text-yellow-300",
		"text-pink-300",
	];
	const color = colors[season % colors.length];

	useEffect(() => {
		if (!loading && !!data) {
			const hasNextPage = page < totalPages;
			onLoaded(list, hasNextPage);
		}
	}, [loading, data]);

	if (error || !data || loading) {
		return null;
	}

	return (
		<Section className={clsx(!isFirstPage && "mt-2")}>
			<Section.Title className={color}>{season}</Section.Title>
			<div className="grid flex-1 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 gap-3">
				{items.map((item) => (
					<a
						key={item.title}
						href={`/animes/${item.slug}`}
						className="flex aspect-2/3"
					>
						<Figure className="size-full">
							<Figure.Image
								src={`/Animes/${item.title}.webp`}
								alt={item.title}
							/>
							<Figcaption>
								<Figcaption.Title className="text-base text-pretty">
									{item.title}
								</Figcaption.Title>
								<Figcaption.Description>共{item.eps}话</Figcaption.Description>
								<Figcaption.Extra>
									{fromNow(item.updated_at)}更新
								</Figcaption.Extra>
							</Figcaption>
						</Figure>
					</a>
				))}
			</div>
		</Section>
	);
};

const Pages = () => {
	// 全量数据
	const [fullItems, setFullItems] = useState<Anime[]>([]);
	const seasons = useMemo(() => {
		return Array.from(
			new Set(fullItems.map((item) => Number(item.season))),
			String,
		);
	}, [fullItems]);

	/**
	 * 分页相关逻辑
	 */

	const [page, setPage] = useState(1);
	const [isLoadingPage, setIsLoadingPage] = useState(true);
	const [hasNextPage, setHasNextPage] = useState(true);

	const { ref: pagerRef, isIntersecting } =
		useIntersectionObserver<HTMLButtonElement>({
			rootMargin: `${window.outerHeight}px`,
		});

	const onPageLoaded: OnPageLoaded = (pageItems, hasNextPage) => {
		setIsLoadingPage(false);
		setFullItems([...fullItems, ...pageItems]);
		setHasNextPage(hasNextPage);
	};

	useEffect(() => {
		if (!isLoadingPage && hasNextPage && isIntersecting) {
			setPage(page + 1);
			setIsLoadingPage(true);
		}
	}, [isLoadingPage, hasNextPage, isIntersecting]);

	return (
		<>
			{Array.from({ length: page }).map((_, i) => {
				const currentPage = i + 1;
				const currentSeason = seasons[i];
				return (
					<SeasonItems
						key={`page-${currentPage}`}
						// 1. 让子组件请求某一页
						page={currentPage}
						// 2. 返回该页数据
						onLoaded={onPageLoaded}
						// 3. 从全量数据中渲染某一年的数据
						items={fullItems.filter((item) => item.season === currentSeason)}
					/>
				);
			})}
			<button
				ref={pagerRef}
				aria-label="下一页"
				className="absolute bottom-0"
			/>
		</>
	);
};

export default Pages;
