import type { ComponentProps, FC } from "preact/compat";
import { clsx } from "@/utils/string";

type Props = ComponentProps<"div"> & {
  iconProps?: ComponentProps<"div">;
};

const Loading: FC<Props> = ({ className, iconProps, ...rest }) => {
  return (
    <div className={clsx("flex items-center justify-center", className)} {...rest}>
      <i
        className={clsx("i-mingcute-loading-3-line animate-spin size-10", iconProps?.className)}
        {...iconProps}
      />
    </div>
  );
};

export default Loading;
