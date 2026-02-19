import { clsx } from "@/helpers/string";

type Props = {
	className?: string;
	iconClassName?: string;
};

const Loading = ({ className, iconClassName }: Props) => {
	return (
		<div className={clsx("flex items-center justify-center", className)}>
			<div className={clsx("size-10", iconClassName)}>
				<span className="i-mingcute-loading-3-line animate-spin" />
			</div>
		</div>
	);
};

export default Loading;
