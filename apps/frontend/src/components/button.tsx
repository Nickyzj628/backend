import { clsx } from "@/helpers/string";
import { CSSProperties, ReactNode } from "preact/compat";

const typeMap = {
    default: "bg-neutral-600 text-white hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600",
    info: "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500",
    success: "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500",
    danger: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500",
    invert: "bg-neutral-700 text-white hover:bg-neutral-900 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-300",
    ghost: "bg-transparent text-neutral-800 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-700"
};
type Type = keyof typeof typeMap;
export type ButtonType = Type;

const softMap = {
    default: "bg-neutral-200/80 text-neutral-800 hover:bg-neutral-200 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/20",
    info: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-400 dark:hover:bg-blue-800/40",
    success: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-400 dark:hover:bg-green-800/40",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-400 dark:hover:bg-yellow-800/40",
    danger: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-400 dark:hover:bg-red-800/40",
    invert: "bg-neutral-300 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-600/30 dark:text-neutral-400 dark:hover:bg-neutral-600/40",
    ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
};

const sizeMap = {
    sm: {
        button: {
            normal: "px-3 py-1.5 text-xs",
            onlyIcon: "p-1.5 text-xs",
        },
        icon: "size-2",
    },
    md: {
        button: {
            normal: "px-4 py-2 text-sm",
            onlyIcon: "p-2 text-sm",
        },
        icon: "size-3",
    },
    lg: {
        button: {
            normal: "px-5 py-2.5 text-sm",
            onlyIcon: "p-2.5 text-sm",
        },
        icon: "size-4",
    },
    xl: {
        button: {
            normal: "px-6 py-3 text-base",
            onlyIcon: "p-3 text-base",
        },
        icon: "size-5",
    },
};
type Size = keyof typeof sizeMap;
export type ButtonSize = Size;

type Props = {
    type?: Type;
    soft?: boolean;
    size?: Size;
    rounded?: boolean | "full";
    disabled?: boolean;
    /**
     * 请传入 @iconify/tailwind4 插件支持的类名，或 JSX 组件
     * @example "icon-[mingcute--align-arrow-left-line]"
     */
    icon?: string | ReactNode;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
};
export type ButtonProps = Props;

/**
 * 按钮，功能和样式参考了 Sailboat UI
 * @see https://sailboatui.com/docs/components/button/
 * @example
 * <Button
 *     type="invert"
 *     soft={false}
 *     size="xl"
 *     rounded="full"
 *     disabled
 *     icon="icon-[mingcute--align-arrow-left-line]"
 *     onClick={() => void 0}
 *     className="mr-3"
 *     style={{ marginLeft: 12 }}
 * >
 *     Hello world
 * </Button>
 */
const Button = ({
    type = "default",
    soft = true,
    size = "md",
    rounded = true,
    disabled = false,
    icon,
    children,
    className,
    style,
    onClick = () => void 0,
}: Props) => {
    const isPresetIcon = icon && typeof icon === "string" && icon.startsWith("icon-");
    const isCustomIcon = icon && !isPresetIcon;

    return (
        <button
            disabled={disabled}
            className={clsx(
                "inline-flex items-center gap-1.5 font-medium text-center transition disabled:opacity-50 disabled:pointer-events-none",
                soft ? softMap[type] : typeMap[type],
                sizeMap[size]["button"][!children ? "onlyIcon" : "normal"],
                rounded === "full" ? "rounded-full" : rounded === true ? "rounded-xl" : "",
                className,
            )}
            style={style}
            onClick={onClick}
        >
            {isPresetIcon && (
                <span className={clsx(
                    icon,
                    sizeMap[size]["icon"],
                    !children && "mx-auto",
                )} />
            )}
            {isCustomIcon && icon}
            {children}
        </button>
    );
};

export default Button;
