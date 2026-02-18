import { ChangeEvent } from "preact/compat";

type SwitchProps = {
    name?: string;
    label?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
};

const Switch = ({
    name,
    label,
    checked,
    defaultChecked,
    onChange,
}: SwitchProps) => {
    const _onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const next = e.currentTarget.checked;
        onChange?.(next);
    };

    return (
        <label className="flex flex-col gap-0.5">
            {label && (
                <span className="text-sm text-neutral-700 transition dark:text-neutral-300">
                    {label}
                </span>
            )}
            <div className="relative w-11 h-6 cursor-pointer">
                <input
                    name={name}
                    type="checkbox"
                    defaultChecked={defaultChecked}
                    checked={checked}
                    className="peer sr-only"
                    onChange={_onChange}
                />
                <span className="absolute inset-0 bg-neutral-200 rounded-full transition peer-checked:bg-neutral-800 dark:bg-neutral-700 dark:peer-checked:bg-neutral-500" />
                <span className="absolute top-1/2 left-0.5 -translate-y-1/2 size-5 rounded-full bg-white transition peer-checked:translate-x-full dark:bg-neutral-400 dark:peer-checked:bg-white" />
            </div>
        </label>
    );
};

export default Switch;