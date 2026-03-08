import type { Blog } from "@nickyzj/shared-types";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Figcaption, Figure } from "@/components/figure";
import Section from "@/components/section";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useBlogsStore } from "@/stores/blog";
import { clsx } from "@/utils/string";
import { fromNow } from "@/utils/time";

type OnPageLoaded = (pageItems: Blog[], hasNextPage: boolean) => void;

const YearItems = ({
	page = 1,
	onLoaded,
	items = [],
}: {
	page: number;
	onLoaded: OnPageLoaded;
	items?: Blog[];
}) => {
	const isFirstPage = page === 1;

	const { loading, error, data } = useBlogsStore({ page });
	const { list = [], totalPages } = data ?? {};

	const year = items[0]?.year;
	const colors = [
		"text-blue-300",
		"text-red-300",
		"text-yellow-300",
		"text-pink-300",
	];
	const color = colors[year % colors.length];

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
			<Section.Title className={color}>{year}</Section.Title>
			<div className="relative grid flex-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
				{items.map((item, index) => {
					const isFirstItem = index === 0;
					return (
						<a
							key={item.title}
							href={`/blogs/${item.slug}`}
							className={clsx(
								"flex aspect-4/3",
								isFirstItem && "col-span-2 row-span-2",
							)}
						>
							<Figure className="size-full">
								<Figure.Image
									src={`/Blogs/${item.title}.webp`}
									alt={item.title}
								/>
								<Figcaption>
									<Figcaption.Title className="text-base text-pretty">
										{item.title}
									</Figcaption.Title>
									<Figcaption.Description>
										{fromNow(item.created_at)}创建
									</Figcaption.Description>
								</Figcaption>
							</Figure>
						</a>
					);
				})}
			</div>
		</Section>
	);
};

const Pages = () => {
	// 全量数据
	const [fullItems, setFullItems] = useState<Blog[]>([]);
	const years = useMemo(() => {
		return Array.from(new Set(fullItems.map((item) => item.year)));
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
				const currentYear = years[i];
				return (
					<YearItems
						key={`page-${currentPage}`}
						// 1. 让子组件请求某一页
						page={currentPage}
						// 2. 返回该页数据
						onLoaded={onPageLoaded}
						// 3. 从全量数据中渲染某一年的数据
						items={fullItems.filter((item) => item.year === currentYear)}
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
