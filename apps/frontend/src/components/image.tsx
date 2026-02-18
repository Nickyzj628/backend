import { getImage } from "@/helpers/network";
import { useEffect, useState } from "preact/hooks";

type Props = {
    /** 支持 WebDav 相对路径、base64、HTTP 地址 */
    src: string;
    /** 默认 /default.webp */
    fallbackSrc?: string;
    alt?: string;
    className?: string;
};
export type ImageProps = Props;

/**
 * 在原生 img 的基础上支持传递 WebDav 相对路径，并添加了回退图片
 * @example
 * <Image src="https://placehold.co/600x400/EEE/31343C" fallbackSrc="/Nickyzj.webp" alt="头像" />
 */
const Image = ({
    src,
    fallbackSrc = "/default.webp",
    alt,
    className
}: Props) => {
    const [fullSrc, setFullSrc] = useState("");

    const applyFallback = () => {
        setFullSrc(getImage(fallbackSrc));
    };

    useEffect(() => {
        if (!src) {
            applyFallback();
        } else if (src.startsWith("/")) {
            setFullSrc(getImage(src));
        } else if (src.startsWith("http") || src.startsWith("data:image/")) {
            setFullSrc(src);
        } else {
            applyFallback();
        }
    }, [src]);

    return (
        <img
            src={fullSrc}
            alt={alt}
            className={className}
            onError={applyFallback}
        />
    );
};

export default Image;
