import { fetcher } from "@nickyzj2023/utils";
import { useEffect, useState } from "preact/hooks";
import { useAsync } from "react-use";
import { BACKEND_PORT, BASE_URL } from "@/etc/constants";
import { request } from "@/helpers/network";

export const api = fetcher(`${BASE_URL}:${BACKEND_PORT}`);

/**
 * 在 react-use/useAsync 基础上封装的请求 hook，和 useSWR 拥有一样的 API
 * @example
 * const { isLoading, error, data } = useRequest<AnimesResp>("/animes?page=1");
 */
export const useRequest = <T>(path: string, options: Recordable = {}) => {
	const {
		loading: isLoading,
		error,
		value: data,
	} = useAsync(() => api.get<T>(path, options), [path]);

	return {
		isLoading,
		error,
		data,
	};
};

/**
 * 在 useRequest 基础上封装的连续请求 hook，每次请求的 data 会保留
 * @example
 * const [page, { dec: prevPage, inc: nextPage }] = useCounter(1);
 * const { isLoading, error, data } = useInfiniteRequest<AnimesResp>(`/animes?page=${page}`);
 * useInterval(() => nextPage(), 1000);
 */
export const useInfiniteRequest = <T>(
	path: string,
	options: Recordable = {},
) => {
	const {
		loading: isLoading,
		error,
		value: data,
	} = useAsync(() => api.get<T>(path, options), [path]);

	const [infiniteData, setInfiniteData] = useState<T[]>([]);
	useEffect(() => {
		if (data) {
			setInfiniteData((prevData) => [...prevData, data]);
		}
	}, [data]);

	return {
		isLoading,
		error,
		data: infiniteData,
	};
};
