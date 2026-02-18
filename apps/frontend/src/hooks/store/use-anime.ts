import { useAsyncFn, useCounter } from "react-use";
import { request } from "@/helpers/network";
import { useInfiniteRequest, useRequest } from "../network";

/**
 * 常规番剧列表请求，只能获取一页数据
 * @example
 * const { isLoading, error, data, hasNextPage } = useAnimes({ page: 1 });
 */
export const useAnimes = (options?: AnimesParams) => {
	const { page = 1 } = options ?? {};
	const { isLoading, error, data } = useRequest<AnimesResp>(
		`/animes?page=${page}`,
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
 * 无限加载番剧列表请求，保留所有已加载页数据
 * @example
 * const { isLoading, error, animes, hasNextPage, nextPage } = useInfiniteAnimes();
 * const loadMore = () => {
 *     if (hasNextPage) {
 *         nextPage();
 *     }
 * };
 */
export const useInfiniteAnimes = () => {
	const [page, { inc: nextPage }] = useCounter(1);
	const { isLoading, error, data } = useInfiniteRequest<AnimesResp>(
		`/animes?page=${page}`,
	);
	const isLoadingFirstPage = !data && isLoading;

	const latestData = data?.at(-1);
	const hasNextPage = latestData?.page < latestData?.totalPages;

	const animes = data ? data.flatMap((pageData) => pageData.list) : [];

	return {
		isLoading,
		isLoadingFirstPage,
		error,
		animes,
		hasNextPage,
		nextPage,
	};
};

/**
 * 获取番剧详情
 * @example
 * const { isLoading, error, data } = useAnime("202507", "NUKITASHI");
 */
export const useAnime = (slug: string) => {
	return useRequest<Anime>(`/animes/${slug}`);
};

/**
 * 更新番剧信息
 * @example
 * const { trigger, isMutating, error } = useAnimeMutation(202507, "NUKITASHI");
 * trigger({
 *   cover: "base64...",
 * });
 */
export const useAnimeMutation = (season: string, title: string) => {
	const [{ loading, error }, trigger] = useAsyncFn(
		(data: Partial<AnimeMutationBody>) => {
			return request(`/animes/${season}/${title}`, {
				method: "PUT",
				body: {
					title,
					season,
					...data,
				},
			});
		},
		[season, title],
	);

	return {
		trigger,
		isMutating: loading,
		error,
	};
};
