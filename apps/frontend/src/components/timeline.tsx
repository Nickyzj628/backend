import { clsx } from "@/helpers/string";
import { ComponentChildren } from "preact";

type Props = {
    time?: string;
    className?: string;
    children: ComponentChildren;
    childrenContainerClassName?: string;
};

const Timeline = ({ time, children, className, childrenContainerClassName: childrenContainerClassname }: Props) => {
    return (
        <div className={className}>
            <div className="pl-2">
                <h3 className="font-medium text-sm text:neutral-500 dark:text-neutral-400">
                    {time}
                </h3>
            </div>
            <div className="flex gap-x-1">
                <div className="relative after:content-[''] after:absolute after:bottom-1.5 after:start-3.5 after:top-7 after:w-px after:translate-x-[-0.5px] after:bg-neutral-300 after:transition dark:after:bg-neutral-600">
                    <div className="relative z-10 flex items-center justify-center size-7">
                        <div className="size-2 rounded-full bg-neutral-400 transition dark:bg-neutral-600" />
                    </div>
                </div>
                <div className={clsx("flex flex-1 flex-wrap gap-3 pt-2.5 pb-8 mb-2", childrenContainerClassname)}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
