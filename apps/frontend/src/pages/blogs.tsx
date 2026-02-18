import { useEffect, useRef, useState } from "preact/hooks";
import { useIntersection } from "react-use";
import { Link } from "wouter-preact";
import { Figcaption, Figure } from "@/components/figure";
import { fromNow } from "@/helpers/time";
import { useBlogs } from "@/hooks/store/use-blog";

const Page = ({ page = 1, onLoaded = (hasNextPage: boolean) => void 0 }) => {
	const { isLoading, error, data, hasNextPage } = useBlogs({ page });

	const blogs = data?.list ?? [];

	useEffect(() => {
		if (!isLoading) {
			onLoaded(hasNextPage);
		}
	}, [isLoading]);

	if (error) {
		return null;
	}

	return (
		<>
			{isLoading &&
				Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="aspect-4/3 rounded-xl bg-neutral-200 transition dark:bg-neutral-800"
					/>
				))}
			{blogs.map((blog) => (
				<Link
					key={blog.title}
					href={`/blogs/${blog.slug}`}
					className="flex aspect-4/3"
				>
					<Figure className="size-full">
						<Figure.Image src={`/Blogs/${blog.title}.webp`} alt={blog.title} />
						<Figcaption>
							<Figcaption.Title className="text-base text-pretty">
								{blog.title}
							</Figcaption.Title>
							<Figcaption.Extra>
								{fromNow(blog.created_at)}创建
							</Figcaption.Extra>
						</Figcaption>
					</Figure>
				</Link>
			))}
		</>
	);
};

const Pages = () => {
	const [page, setPage] = useState(1);
	const [isLoadingPage, setIsLoadingPage] = useState(true);
	const [hasNextPage, setHasNextPage] = useState(true);

	const nextPage = () => {
		setPage((prev) => prev + 1);
		setIsLoadingPage(true);
	};

	const onPageLoaded = (hasNextPage: boolean) => {
		setHasNextPage(hasNextPage);
		setIsLoadingPage(false);
	};

	const pager = useRef<HTMLButtonElement>(null);
	const intersection = useIntersection(pager, {});
	useEffect(() => {
		if (isLoadingPage || !hasNextPage || !intersection?.isIntersecting) {
			return;
		}
		nextPage();
	}, [isLoadingPage, hasNextPage, intersection]);

	return (
		<div className="relative grid flex-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
			{Array.from({ length: page }).map((_, i) => (
				<Page key={i} page={i + 1} onLoaded={onPageLoaded} />
			))}
			{hasNextPage && (
				<button
					ref={pager}
					aria-label="下一页"
					className="size-full rounded-xl"
					onClick={nextPage}
				/>
			)}
		</div>
	);
};

export default Pages;
