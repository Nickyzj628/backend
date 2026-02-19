import type { CSSProperties } from "preact";
import { forwardRef, type ReactNode } from "preact/compat";
import type { MutableRef } from "preact/hooks";
import { clsx } from "@/utils/string";

const typeMap = {
	info: {
		wrapper: "bg-blue-50 text-blue-500 dark:bg-blue-950",
		icon: <div className="i-mingcute-information-fill size-6 shrink-0" />,
	},
	success: {
		wrapper: "bg-green-50 text-green-500 dark:bg-green-950",
		icon: <div className="i-mingcute-check-circle-fill size-6 shrink-0" />,
	},
	warning: {
		wrapper: "bg-yellow-50 text-yellow-500 dark:bg-yellow-950",
		icon: <div className="i-mingcute-warning-fill size-6 shrink-0" />,
	},
	danger: {
		wrapper: "bg-red-50 text-red-500 dark:bg-red-950",
		icon: <div className="i-mingcute-close-circle-fill size-6 shrink-0" />,
	},
};
type Type = keyof typeof typeMap;
export type AlertType = Type;

type Props = {
	type?: Type;
	title?: string;
	description?: string | ReactNode;
	className?: string;
	style?: CSSProperties;
	actions?: { text: string; onClick: () => void }[];
	showIcon?: boolean;
	showClose?: boolean;
	onClose?: () => void;
};
export type AlertProps = Props;

/**
 * 警告，功能和样式参考了 Sailboat UI
 * @see https://sailboatui.com/docs/components/alert/
 * @example
 * <Alert
 *     type="danger"
 *     title="错误"
 *     description="请求发送失败"
 *     className="shadow-xl"
 *     style={{ transform: "translateY(-8px)" }}
 *     actions={[
 *         { text: "好的", onClick: () => {} },
 *         { text: "重试", onClick: () => {} },
 *     ]}
 *     showIcon={false}
 *     showClose
 *     onClose={() => {}}
 * />
 */
const Alert = forwardRef(
	(
		{
			type = "info",
			title,
			description,
			className,
			style,
			actions = [],
			showIcon = true,
			showClose = false,
			onClose = () => {},
		}: Props,
		ref: MutableRef<HTMLDivElement>,
	) => {
		return (
			<div
				ref={ref}
				className={clsx(
					"flex gap-3 p-3 rounded-xl text-sm transition",
					typeMap[type].wrapper,
					className,
				)}
				style={style}
			>
				{showIcon && typeMap[type].icon}
				<div>
					{title && (
						<h4 className="text-current font-bold leading-none">{title}</h4>
					)}
					{description && <p className="mt-1">{description}</p>}
					{actions.length > 0 && (
						<div className="flex gap-4 mt-2">
							{actions.map((action, index) => (
								<button
									key={index}
									className="font-bold leading-loose"
									onClick={action.onClick}
								>
									{action.text}
								</button>
							))}
						</div>
					)}
				</div>
				{showClose && (
					<button className="shrink-0 ml-auto" onClick={onClose}>
						<span className="size-4">
							<span className="i-mingcute-close-line" />
						</span>
					</button>
				)}
			</div>
		);
	},
);

export default Alert;
