import { clsx } from "@/helpers/string";
import { sleep } from "@/helpers/time";
import { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

type Props = {
    isOpen: boolean;
    title?: string;
    children?: ComponentChildren;
    onClose: () => void;
};

const LifeCycle = {
    BeforeOpen: 0,
    Opened: 1,
    BeforeClose: 2,
    Closed: 3,
} as const;

type LifeCycle = (typeof LifeCycle)[keyof typeof LifeCycle];

const Drawer = ({
    isOpen = false,
    title = "未命名抽屉",
    children,
    onClose,
}: Props) => {
    const [lifeCycle, setLifeCycle] = useState<LifeCycle>(LifeCycle.Closed);

    const onOpen = async () => {
        setLifeCycle(LifeCycle.BeforeOpen);
        await sleep(30);
        setLifeCycle(LifeCycle.Opened);
    };

    const _onClose = async () => {
        setLifeCycle(LifeCycle.BeforeClose);
        await sleep(150);
        onClose();
        setLifeCycle(LifeCycle.Closed);
    };

    // 淡入淡出
    useEffect(() => {
        if (isOpen) onOpen();
        else _onClose();
    }, [isOpen]);

    if (lifeCycle === LifeCycle.Closed) {
        return null;
    }

    return createPortal(
        <div className="fixed top-0 right-0 z-50 size-full">
            {/* 背景遮罩 */}
            <div
                className={clsx(
                    "absolute top-0 left-0 size-full cursor-pointer transition",
                    (lifeCycle === LifeCycle.BeforeOpen || lifeCycle === LifeCycle.Opened) && "bg-black/60",
                )}
                onClick={_onClose}
            />
            {/* 抽屉 */}
            <div
                className={clsx(
                    "relative flex flex-col gap-3 w-80 h-full p-3 ml-auto bg-white transition dark:bg-neutral-900",
                    (lifeCycle === LifeCycle.BeforeOpen || lifeCycle === LifeCycle.BeforeClose) && "translate-x-full",
                )}
            >
                <div className="flex gap-3 justify-between items-center">
                    <h3>{title}</h3>
                    <button onClick={_onClose}>
                        <span className="icon-[mingcute--close-line]" />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Drawer;
