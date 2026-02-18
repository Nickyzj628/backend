import { getImage } from "@/helpers/network";
import { clsx } from "@/helpers/string";
import Image from "./image";

const sizeMap = {
    sm: {
        wrapper: "w-6 h-6",
        state: "w-1.5 h-1.5",
    },
    md: {
        wrapper: "w-8 h-8",
        state: "w-2 h-2",
    },
    lg: {
        wrapper: "w-10 h-10",
        state: "w-2.5 h-2.5",
    },
    xl: {
        wrapper: "w-12 h-12",
        state: "w-3 h-3",
    },
    "2xl": {
        wrapper: "w-14 h-14",
        state: "w-3.5 h-3.5",
    },
};
type Size = (keyof typeof sizeMap) | (string & {});
export type AvatarSize = Size;

const stateMap = {
    Online: "bg-green-400",
    Offline: "bg-neutral-300",
    Busy: "bg-red-400",
};
type State = keyof typeof stateMap;
export type AvatarState = State;

type Props = {
    name?: string;
    size?: Size;
    rounded?: boolean;
    /** 与自定义 size 互斥，此时无法计算 state 尺寸，故无法显示 */
    state?: State;
    className?: string;
};
export type AvatarProps = Props;

/**
 * 头像，功能和样式参考了 Sailboat UI
 * @see https://sailboatui.com/docs/components/avatar/
 * @example
 * <Avatar 
 *     name="Nickyzj" 
 *     size="lg"
 *     rounded 
 *     state="Online"
 *     className="mr-1"
 * />
 */
const Avatar = ({
    name = "Guest",
    size = "sm",
    rounded = false,
    state,
    className,
}: Props) => {
    return (
        <div className={clsx(
            "relative",
            size in sizeMap ? sizeMap[size]["wrapper"] : size,
            className,
        )}>
            <Image
                src={getImage(`/Avatars/${name}.webp`)}
                fallbackSrc="/Avatars/Guest.webp"
                alt={name}
                className={clsx(
                    "h-full w-full object-cover object-center",
                    rounded ? "rounded-lg" : "rounded-full",
                )}
            />
            {state && (
                <span className={clsx(
                    "absolute right-0 bottom-0 rounded-full ring ring-white",
                    stateMap[state],
                    size in sizeMap && sizeMap[size]["state"],
                )} />
            )}
        </div>
    );
};

export default Avatar;
