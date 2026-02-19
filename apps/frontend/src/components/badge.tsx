import type { ReactNode } from "preact/compat";
import { clsx } from "@/utils/string";

const typeMap = {
	default:
		"bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
	info: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
	success: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
	warning:
		"bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
	danger: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
	invert: "bg-black text-white dark:bg-white dark:text-black",
};
type Type = keyof typeof typeMap;
export type BadgeType = Type;

const sizeMap = {
	sm: {
		wrapper: "px-2 py-1 text-xs",
		icon: "w-3 h-3",
	},
	md: {
		wrapper: "px-3 py-1 text-sm",
		icon: "w-4 h-4",
	},
};
type Size = keyof typeof sizeMap;
export type BadgeSize = Size;

type Props = {
	type?: Type;
	size?: Size;
	rounded?: boolean;
	className?: string;
	icon?: ReactNode;
	children?: ReactNode;
	showClose?: boolean;
	onClose?: () => void;
};
export type BadgeProps = Props;

/**
 * 徽标，功能和样式参考了 Sailboat UI
 * @see https://sailboatui.com/docs/components/badge/
 * @example
 * <Badge
 *     type="info"
 *     size="middle"
 *     rounded
 *     className="mr-1"
 *     icon={<span className="icon-[mingcute--align-arrow-left-line]" />}
 *     showClose
 *     onClose={() => console.log("点击了右侧关闭按钮")}
 * >
 *     帅Pi 26
 * </Badge>
 */
const Badge = ({
	type = "default",
	size = "sm",
	rounded = false,
	className,
	icon,
	children,
	showClose = false,
	onClose = () => void 0,
}: Props) => {
	return (
		<span
			className={clsx(
				"inline-flex items-center gap-1 font-semibold transition",
				rounded ? "rounded-full" : "rounded-lg",
				typeMap[type],
				sizeMap[size]["wrapper"],
				className,
			)}
		>
			{icon}
			{children}
			{showClose && (
				<span
					className={clsx(
						"opacity-80 cursor-pointer hover:opacity-100",
						sizeMap[size]["icon"],
					)}
					onClick={onClose}
				>
					<i className="i-mingcute-close-line" />
				</span>
			)}
		</span>
	);
};

export default Badge;
