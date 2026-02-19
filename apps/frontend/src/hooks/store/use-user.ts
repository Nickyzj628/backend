import { randomInt } from "@nickyzj2023/utils";
import createPersistGlobalState from "@/utils/create-persist-global-state";

const useUser = createPersistGlobalState("user", () => ({
	id: crypto.randomUUID(),
	name: `无名客${randomInt(1000, 9999)}`,
}));

export default useUser;
