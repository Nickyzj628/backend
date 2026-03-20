import type { ComponentProps, CSSProperties } from "preact";
import type { FC, ReactNode } from "preact/compat";
import { clsx } from "@/utils/string";

const variantMap = {
  default:
    "bg-neutral-600 text-white hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600",
  info: "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500",
  success: "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500",
  warning:
    "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500",
  danger: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500",
  invert:
    "bg-neutral-700 text-white hover:bg-neutral-900 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-300",
  ghost:
    "bg-transparent text-neutral-800 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-700",
};
export type ButtonVariant = keyof typeof variantMap;

const softMap = {
  default:
    "bg-neutral-200/80 text-neutral-800 hover:bg-neutral-200 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/20",
  info: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-400 dark:hover:bg-blue-800/40",
  success:
    "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-400 dark:hover:bg-green-800/40",
  warning:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-400 dark:hover:bg-yellow-800/40",
  danger:
    "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-400 dark:hover:bg-red-800/40",
  invert:
    "bg-neutral-300 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-600/30 dark:text-neutral-400 dark:hover:bg-neutral-600/40",
  ghost:
    "bg-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
};

const sizeMap = {
  sm: {
    regular: "px-3 py-1.5 text-xs",
    onlyIcon: "p-1.5 text-xs",
  },
  md: {
    regular: "px-4 py-2 text-sm",
    onlyIcon: "p-2 text-sm",
  },
  lg: {
    regular: "px-5 py-2.5 text-sm",
    onlyIcon: "p-2.5 text-sm",
  },
  xl: {
    regular: "px-6 py-3 text-base",
    onlyIcon: "p-3 text-base",
  },
};
export type ButtonSize = keyof typeof sizeMap;

type Props = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  soft?: boolean;
  size?: ButtonSize;
  rounded?: boolean | "full";
  icon?: ReactNode;
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
 *     icon={<span className="icon-[mingcute--align-arrow-left-line]" />}
 *     onClick={() => void 0}
 *     className="mr-3"
 *     style={{ marginLeft: 12 }}
 * >
 *     Hello world
 * </Button>
 */
const Button: FC<Props> = ({
  variant = "default",
  soft = true,
  size = "md",
  rounded = true,
  disabled = false,
  icon,
  children,
  className,
  style,
  onClick = () => void 0,
  ...restProps
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium text-center transition disabled:opacity-50 disabled:pointer-events-none",
        soft ? softMap[variant] : variantMap[variant],
        sizeMap[size][!children ? "onlyIcon" : "regular"],
        rounded === "full" ? "rounded-full" : rounded === true ? "rounded-xl" : "",
        className,
      )}
      style={style}
      onClick={onClick}
      {...restProps}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;
