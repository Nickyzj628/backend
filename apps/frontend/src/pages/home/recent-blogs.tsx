import { useEffect } from "preact/hooks";
import { Link } from "wouter-preact";
import Loading from "@/components/loading";
import Section from "@/components/section";
import { getImage } from "@/helpers/network";
import { clsx } from "@/helpers/string";
import { fromNow } from "@/helpers/time";
import { useInfiniteBlogs } from "@/hooks/store/use-blog";

const RecentBlogs = () => {
	const { isLoadingFirstPage, hasNextPage, error, blogs, nextPage } =
		useInfiniteBlogs();

	// 如果文章数量不满足 3 篇，且还有下一页，则继续请求
	useEffect(() => {
		if (!isLoadingFirstPage && blogs.length < 3 && hasNextPage) {
			nextPage();
		}
	}, [blogs, isLoadingFirstPage, hasNextPage]);

	return (
		<Section className={"aspect-[2/3] w-full sm:w-80 lg:w-96 mt-2"}>
			<Section.Title className="text-red-300">近期文章</Section.Title>
			<div
				className={clsx(
					"flex flex-col flex-1 text-neutral-400 rounded-xl bg-neutral-100 overflow-hidden transition dark:text-neutral-500 dark:bg-neutral-800",
					blogs.length === 0 && "items-center justify-center",
				)}
			>
				{isLoadingFirstPage && <Loading />}
				{error && (
					<div className="flex flex-col items-center">
						<div className="icon-[mingcute--pic-line] size-32" />
						<p>{error.message}</p>
					</div>
				)}
				{blogs.slice(0, 3).map((blog, i) => (
					<Link
						key={blog.title}
						href={`/blogs/${blog.slug}`}
						className="flex flex-1 w-full bg-zinc-200 bg-center bg-cover"
						style={{
							backgroundImage: `url(${getImage(`/Blogs/${blog.title}.webp`)}), url(${getImage(`/default.webp`)})`,
						}}
					>
						<div
							className={clsx(
								"group flex flex-col items-center justify-center size-full p-3 transition",
								i === 0 ? "bg-black/40" : "bg-black/60 hover:bg-black/40",
							)}
						>
							<h4
								className={clsx(
									"text-balance text-center",
									i === 0
										? "text-white"
										: "text-neutral-400 group-hover:text-white",
								)}
							>
								{blog.title}
							</h4>
							<span
								className={clsx(
									"text-sm transition",
									i === 0
										? "text-white"
										: "text-neutral-400 group-hover:text-white",
								)}
							>
								{fromNow(blog.created_at)}创建
							</span>
						</div>
					</Link>
				))}
			</div>
		</Section>
	);
};

export default RecentBlogs;
