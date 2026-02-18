import { clsx } from "@/helpers/string";
import { ReactNode } from "preact/compat";

type SectionProps = {
    className?: string;
    children?: ReactNode;
};

type TitleProps = {
    className?: string;
    markClassName?: string;
    children: ReactNode;
};

const Section = ({ className, children, }: SectionProps) => {
    return (
        <div className={clsx("flex flex-col gap-1.5", className)}>
            {children}
        </div>
    );
};

Section.Title = ({
    className = "text-neutral-300 dark:text-neutral-600/60",
    markClassName = "",
    children,
}: TitleProps) => {
    return (
        <div className={clsx("flex items-center gap-1.5 transition", className)}>
            <div className={clsx("w-2.5 h-6 rounded-full bg-current", markClassName)} />
            <h4>{children}</h4>
        </div>
    );
};

export default Section;
