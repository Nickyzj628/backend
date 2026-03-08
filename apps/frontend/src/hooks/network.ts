import { fetcher } from "@nickyzj2023/utils";
import { useAsync } from "react-use";
import type { Recordable } from "@/types/common";
import { BACKEND_PORT, BASE_URL } from "@/utils/constants";

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
