import { useAsyncFn, useCounter } from "react-use";
import { request } from "@/helpers/network";
import { useInfiniteRequest, useRequest } from "../network";

/**
 * 常规文章列表请求，只能获取一页数据
 * @example
 * const { isLoading, error, data, hasNextPage } = useBlogs({ page: 1 });
 */
export const useBlogs = (options?: BlogsParams) => {
	const { page = 1 } = options ?? {};
	const { isLoading, error, data } = useRequest<BlogsResp>(
		`/blogs?page=${page}`,
	);

	const hasPrevPage = data ? page > 1 : false;
	const hasNextPage = data ? page < data.totalPages : false;

	return {
		isLoading,
		error,
		data,
		hasPrevPage,
		hasNextPage,
	};
};

/**
 * 无限加载文章列表请求，保留所有已加载页数据
 * @example
 * const { isLoading, error, blogs, hasNextPage, nextPage } = useInfiniteBlogs();
 * const loadMore = () => {
 *     if (hasNextPage) {
 *         nextPage();
 *     }
 * };
 */
export const useInfiniteBlogs = () => {
	const [page, { inc: nextPage }] = useCounter(1);
	const { isLoading, error, data } = useInfiniteRequest<BlogsResp>(
		`/blogs?page=${page}`,
	);
	const isLoadingFirstPage = !data && isLoading;

	const latestData = data?.at(-1);
	const hasNextPage = latestData?.page < latestData?.totalPages;

	const blogs = data ? data.flatMap((pageData) => pageData.list) : [];

	return {
		isLoading,
		isLoadingFirstPage,
		error,
		blogs,
		hasNextPage,
		nextPage,
	};
};

/**
 * 获取文章详情
 * @example
 * const { isLoading, error, data } = useBlog("nian-du-zong-jie-2");
 */
export const useBlog = (slug: string) => {
	return useRequest<Blog>(`/blogs/${slug}`);
};

/**
 * 更新文章信息
 * @example
 * const { trigger, isMutating, error } = useBlogMutation(2025, "年度总结2");
 * trigger({
 *   cover: "base64...",
 * });
 */
export const useBlogMutation = (year: number, title: string) => {
	const [{ loading, error }, trigger] = useAsyncFn(
		(data: Partial<BlogMutationBody>) => {
			return request(`/blogs/${year}/${title}`, {
				method: "PUT",
				body: {
					title,
					year,
					...data,
				},
			});
		},
		[year, title],
	);

	return {
		trigger,
		isMutating: loading,
		error,
	};
};
