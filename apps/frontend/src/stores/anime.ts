import { useStore } from "@nanostores/preact";
import type {
	AnimeResp,
	AnimesParams,
	AnimesResp,
} from "@nickyzj/shared-types";
import { qs } from "@nickyzj2023/utils";
import { useMemo } from "preact/hooks";
import { createFetcherStore } from "./fetcher";

export const useAnimesStore = (queryParams?: AnimesParams) => {
	const queryString = qs.stringify(queryParams, { addQueryPrefix: true });

	const store = useMemo(() => {
		return createFetcherStore<AnimesResp>(["/animes", queryString]);
	}, [queryString]);

	return useStore(store);
};

export const useAnimeStore = (slug = "") => {
	const store = useMemo(() => {
		return createFetcherStore<AnimeResp>(["/animes/", slug]);
	}, [slug]);

	return useStore(store);
};
