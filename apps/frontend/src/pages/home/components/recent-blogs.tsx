import Loading from "@/components/loading";
import Section from "@/components/section";
import { useBlogsStore } from "@/stores/blog";
import { getImage } from "@/utils/network";
import { clsx } from "@/utils/string";
import { fromNow } from "@/utils/time";

const RecentBlogs = () => {
	const { loading, error, data, ...rest } = useBlogsStore();
	const { list = [] } = data ?? {};

	return (
		<Section className={"aspect-2/3 w-full sm:w-80 lg:w-96 mt-2"}>
			<Section.Title className="text-red-300">近期文章</Section.Title>
			<div
				className={clsx(
					"flex flex-col flex-1 text-neutral-400 rounded-xl bg-neutral-100 overflow-hidden transition dark:text-neutral-500 dark:bg-neutral-800",
					!list.length && "items-center justify-center",
				)}
			>
				{loading && <Loading />}
				{error && (
					<div className="flex flex-col items-center">
						<i className="i-mingcute-pic-line size-32" />
						<p>{error.message}</p>
					</div>
				)}
				{list.slice(0, 3).map((blog, i) => (
					<a
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
								i === 0
									? "backdrop-brightness-60"
									: "backdrop-blur-2 backdrop-brightness-40 hover:backdrop-blur-0 hover:backdrop-brightness-60",
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
					</a>
				))}
			</div>
		</Section>
	);
};

export default RecentBlogs;
