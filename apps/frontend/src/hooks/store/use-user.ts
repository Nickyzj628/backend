import createPersistedGlobalState from "@/etc/create-persisted-global-state";
import { random } from "@/helpers/number";

const useUser = createPersistedGlobalState("user", () => ({
    id: crypto.randomUUID(),
    name: `无名客${random(1000, 9999)}`,
}));

export default useUser;
