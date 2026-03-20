import type { FC } from "preact/compat";
import { useEffect } from "preact/hooks";
import { useToggle } from "react-use";
import type { Recordable } from "@/types/common";
import { clsx } from "@/utils/string";
import Button from "./button";

/**
 * 切换按钮组件
 * @remarks 显示为汉堡菜单图标，点击后变为关闭图标
 */
type Props = Recordable & {
  value?: boolean;
  onChange?: (value: boolean) => void;
};

const Toggle: FC<Props> = ({ value = false, onChange = () => {}, className, ...restProps }) => {
  const [isClick, toggleClick] = useToggle(value);

  // 根据点击事件改变状态
  const onClick = () => {
    const next = !isClick;
    toggleClick(next);
    onChange(next);
  };

  // 根据 props 改变状态
  useEffect(() => {
    toggleClick(value === true);
  }, [value]);

  return (
    <Button
      variant={isClick ? "info" : "default"}
      size="xl"
      rounded="full"
      className={clsx("flex-col justify-center size-10", className)}
      icon={
        <>
          <div className={clsx("w-full transition-transform", isClick && "translate-y-1")}>
            <div
              className={clsx(
                "w-full h-0.5 rounded-full bg-current transition-transform",
                isClick && "rotate-45",
              )}
            />
          </div>
          <div className={clsx("w-full transition-transform", isClick && "-translate-y-1")}>
            <div
              className={clsx(
                "w-full h-0.5 rounded-full bg-current transition-transform",
                isClick && "-rotate-45",
              )}
            />
          </div>
        </>
      }
      onClick={onClick}
      {...restProps}
    />
  );
};

export default Toggle;
