import { persistentMap } from "@nanostores/persistent";
import { useStore } from "@nanostores/preact";

type PreferenceValue = {
  aside: "full" | "folded";
  theme: "light" | "dark";
};

const preferenceStore = persistentMap<PreferenceValue>("preference:", {
  aside: "full",
  theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
});

export const usePreferenceStore = () => {
  const data = useStore(preferenceStore);
  return {
    data,
    set: preferenceStore.set,
    setKey: preferenceStore.setKey,
  };
};
