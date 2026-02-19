import { randomInt } from "@nickyzj2023/utils";
import createPersistedGlobalState from "@/utils/create-persisted-global-state";

const useUser = createPersistedGlobalState("user", () => ({
	id: crypto.randomUUID(),
	name: `无名客${randomInt(1000, 9999)}`,
}));

export default useUser;
