import { useStore } from "@nanostores/preact";
import type { BlogResp, BlogsParams, BlogsResp } from "@nickyzj2023/shared-types";
import { qs } from "@nickyzj2023/utils";
import { useMemo } from "preact/hooks";
import { createFetcherStore } from "./fetcher";

export const useBlogsStore = (queryParams?: BlogsParams) => {
	const queryString = qs.stringify(queryParams, { addQueryPrefix: true });

	const store = useMemo(() => {
		return createFetcherStore<BlogsResp>(["/blogs", queryString]);
	}, [queryString]);

	return useStore(store);
};

export const useBlogStore = (slug = "") => {
	const store = useMemo(() => {
		return createFetcherStore<BlogResp>(["/blogs/", slug]);
	}, [slug]);

	return useStore(store);
};
