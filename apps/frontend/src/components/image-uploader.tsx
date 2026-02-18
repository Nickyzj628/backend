import { compressImageFromFile } from "@/helpers/compress-image";
import { clsx } from "@/helpers/string";
import { ChangeEvent } from "preact/compat";
import { toast } from "react-hot-toast/headless";
import Img from "./image";

type Props = {
    name?: string;
    label?: string;
    value?: any;
    className?: string;
    onChange?: (value: any) => void;
};

const ImageUploader = ({
    name,
    label,
    value = "/default.webp",
    className,
    onChange,
}: Props) => {
    const _onChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files[0];
        if (!file) return;
        try {
            const compressedBase64 = await compressImageFromFile(file, { maxHeight: 512 });
            onChange?.(compressedBase64);
        } catch (err) {
            toast.error(`压缩图片失败：${err.message}`);
        }
    };

    return (
        <label className="flex flex-col gap-0.5">
            {label && (
                <span className="text-sm text-neutral-700 transition dark:text-neutral-300">
                    {label}
                </span>
            )}
            <input
                name={name}
                type="file"
                accept=".jpg, .png"
                value={value}
                className="sr-only"
                onChange={_onChange}
            />
            <Img
                src={value}
                className={clsx("rounded-xl cursor-pointer", className)}
            />
        </label>
    );
};

export default ImageUploader;