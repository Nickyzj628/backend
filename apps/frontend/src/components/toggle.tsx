import { clsx } from "@/helpers/string";
import { useEffect, useState } from "preact/hooks";
import Button from "./button";

type Props = {
    value?: boolean;
    className?: string;
    onChange?: (value: boolean) => void;
}

const Toggle = ({
    value,
    className,
    onChange = (value) => void 0,
}: Props) => {
    const [isClicked, setIsClicked] = useState(false);

    const onClick = () => {
        const next = !isClicked;
        setIsClicked(next);
        onChange(next);
    };

    useEffect(() => {
        setIsClicked(value === true);
    }, [value]);

    return (
        <Button
            type={isClicked ? "info" : "default"}
            size="xl"
            rounded="full"
            className={clsx("flex-col justify-center size-10", className)}
            icon={<>
                <div className={clsx("w-full transition-transform", isClicked && "translate-y-1")}>
                    <div
                        className={clsx(
                            "w-full h-0.5 rounded-full bg-current transition-transform",
                            isClicked && "rotate-45"
                        )}
                    />
                </div>
                <div className={clsx("w-full transition-transform", isClicked && "-translate-y-1")}>
                    <div
                        className={clsx(
                            "w-full h-0.5 rounded-full bg-current transition-transform",
                            isClicked && "-rotate-45"
                        )}
                    />
                </div>
            </>}
            onClick={onClick}
        />
    );
};

export default Toggle;
