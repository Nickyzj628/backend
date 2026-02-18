import { clsx } from "@/helpers/string";
import { ComponentChildren, createContext } from "preact";
import { CSSProperties } from "preact/compat";
import { useContext, useEffect, useState } from "preact/hooks";

type TabsContextType = {
    value: any;
    setValue: (value: any) => void;
};

type TabsProps = {
    defaultValue: any;
    className?: string;
    style?: CSSProperties;
    children: ComponentChildren;
};

type TabsListProps = {
    className?: string;
    children: ComponentChildren;
    onChange?: (value: any) => void;
};

type TabsTriggerProps = {
    value: any;
    className?: string;
    children: ComponentChildren;
};

type TabsContentProps = {
    value: any;
    className?: string;
    as?: ComponentChildren;
    keepAlive?: boolean;
    children?: ComponentChildren;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const Tabs = ({ defaultValue, className, style, children }: TabsProps) => {
    const [value, setValue] = useState(defaultValue);

    return (
        <div className={clsx("flex flex-col gap-1.5", className)} style={style}>
            <TabsContext.Provider value={{ value, setValue }}>
                {children}
            </TabsContext.Provider>
        </div>
    );
};

Tabs.List = ({ className, children, onChange }: TabsListProps) => {
    const { value } = useContext(TabsContext);
    useEffect(() => {
        onChange?.(value);
    }, [value])

    return (
        <div className={clsx("flex shrink-0 gap-1 p-1 rounded-xl bg-neutral-100 overflow-x-auto transition dark:bg-neutral-700", className)}>
            {children}
        </div>
    );
};

Tabs.Trigger = ({ value, className, children }: TabsTriggerProps) => {
    const { value: contextValue, setValue } = useContext(TabsContext);
    const isActive = value === contextValue;

    const onClick = () => {
        setValue(value);
    };

    return (
        <button
            className={clsx(
                "inline-flex flex-1 justify-center px-5 py-1.5 whitespace-nowrap rounded-xl transition dark:text-neutral-100",
                isActive ? "bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-800" : "bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800",
                className,
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

Tabs.Content = ({ value, className, as, keepAlive = true, children }: TabsContentProps) => {
    const { value: contextValue } = useContext(TabsContext);
    const isVisible = value === contextValue;

    if (!isVisible && !keepAlive) return null;

    if (as) return as;

    return (
        <div className={clsx(isVisible ? "block" : "hidden", className)}>
            {children}
        </div>
    );
};

export default Tabs;
