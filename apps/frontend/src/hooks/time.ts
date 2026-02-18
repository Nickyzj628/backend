import { useEffect, useState } from "preact/hooks";

export const useNextTick = (callback: () => void) => {
    const [shouldRun, setShouldRun] = useState(false);

    useEffect(() => {
        if (!shouldRun) {
            return;
        }
        callback();
        setShouldRun(false);
    }, [shouldRun]);

    return () => {
        setShouldRun(true);
    };
};
