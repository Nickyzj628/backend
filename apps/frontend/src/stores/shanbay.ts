import { useStore } from "@nanostores/preact";
import type { Shanbay } from "@nickyzj2023/shared-types";
import { createFetcherStore } from "./fetcher";

const shanbayStore = createFetcherStore<Shanbay>("/shanbay");

export const useShanbayStore = () => {
	return useStore(shanbayStore);
};
