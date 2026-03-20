import { nanoquery } from "@nanostores/query";
import { fetcher } from "@nickyzj2023/utils";

const api = fetcher("https://nickyzj.run:3030");

export const [createFetcherStore, createMutatorStore] = nanoquery({
  fetcher: (...keys) => api.get(keys.join("")),
  dedupeTime: Infinity,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
});
