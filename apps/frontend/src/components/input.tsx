import { clsx } from "@/helpers/string";
import { HTMLInputTypeAttribute } from "preact/compat";

type Props = {
    name?: string;
    type?: HTMLInputTypeAttribute;
    accept?: string;
    label?: string;
    readOnly?: boolean;
    disabled?: boolean;
    defaultValue?: any;
    value?: any;
    placeholder?: string;
    className?: string;
    onChange?: (value: any) => void;
};

const Input = ({
    label,
    type = "text",
    className,
    onChange,
    ...restProps
}: Props) => {
    return (
        <label className="flex flex-col gap-0.5">
            {label && (
                <span className="text-sm text-neutral-700 transition dark:text-neutral-300">
                    {label}
                </span>
            )}
            <input
                type={type}
                className={clsx(
                    "outline-none border-transparent rounded-md bg-neutral-100 transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-neutral-400 focus:bg-white dark:text-white dark:bg-neutral-800 dark:focus:border-neutral-500 dark:focus:bg-neutral-900",
                    className,
                )}
                onChange={(e) => onChange?.(e.currentTarget.value)}
                {...restProps}
            />
        </label>
    );
};

export default Input;