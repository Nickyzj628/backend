import { createGlobalState } from "react-use";

/**
 * 在 react-use/createGlobalState 的基础上实现持久化缓存
 * @param key 缓存键
 * @param getInitialValue 获取初始值的函数
 * @example
 * const useUser = createPersistedGlobalState("user", () => ({ id: 1, name: "roxyzzz" }));
 * const [user, setUser, removeUser] = useUser();
 * // 缓存到 localStorage，供下次使用
 * setUser({ id: 1, name: "roxy" });
 * // 清除缓存
 * removeUser();
 */
const createPersistedGlobalState = <T>(key: string, getInitialValue: () => T) => {
    // 如果 localStorage 里没有值，则缓存初始值，供下次使用
    let cachedValue = localStorage.getItem(key);
    if (!cachedValue) {
        cachedValue = JSON.stringify(getInitialValue());
        localStorage.setItem(key, cachedValue);
    }

    const useGlobalValue = createGlobalState<T>(JSON.parse(cachedValue));

    return () => {
        const [value, setValue] = useGlobalValue();
        const persistValue = (value: T) => {
            setValue(value);
            localStorage.setItem(key, JSON.stringify(value));
        };
        const removeValue = () => {
            setValue(undefined);
            localStorage.removeItem(key);
        };

        return [value, persistValue, removeValue] as const;
    };
};

export default createPersistedGlobalState;
