import { persistentMap } from "@nanostores/persistent";
import { useStore } from "@nanostores/preact";
import { randomInt } from "@nickyzj2023/utils";

const userStore = persistentMap("user:", {
	id: crypto.randomUUID(),
	name: `无名客${randomInt(1000, 9999)}`,
});

export const useUserStore = () => {
	const data = useStore(userStore);
	return {
		data,
		set: userStore.set,
		setKey: userStore.setKey,
	};
};
