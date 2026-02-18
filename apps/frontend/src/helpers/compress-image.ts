type CompressionOptions = {
    maxWidth?: number;
    maxHeight?: number;
    maxSizeKB?: number;
    /** 图片质量，从 0 到 1，默认 0.92 */
    quality?: number;
};

const compressImage = async (
    src: string,
    options: CompressionOptions = {},
) => {
    return new Promise<string>((resolve, reject) => {
        const img = new Image();

        img.onload = async () => {
            const {
                maxWidth,
                maxHeight,
                maxSizeKB,
                quality = 0.92,
            } = options;

            let width = img.width;
            let height = img.height;

            // 如果缩放，应该保持宽高比
            if (maxWidth && width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
            if (maxHeight && height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("无法创建Canvas，可能是浏览器版本太旧了？"));
            }

            ctx.drawImage(img, 0, 0, width, height);

            // 先压缩成 jpg，并降低图片质量
            let base64 = canvas.toDataURL("image/jpeg", quality);

            // 如果有最大体积限制，并且当前体积超过了限制，再继续压缩
            if (maxSizeKB) {
                // 近似计算 base64 图片的大小
                const base64SizeKB = base64.length * (3 / 4) / 1024;
                if (base64SizeKB > maxSizeKB) {
                    let lowQuality = quality - 0.1;
                    let lowBase64 = canvas.toDataURL("image/jpeg", lowQuality);
                    while (lowBase64.length * (3 / 4) / 1024 > maxSizeKB && lowQuality > 0) {
                        lowQuality -= 0.1;
                        lowBase64 = canvas.toDataURL("image/jpeg", Math.max(0, lowQuality));
                    }
                    base64 = lowBase64;
                }
            }

            resolve(base64);
        };

        img.onerror = (err) => {
            reject(new Error(`加载图片失败：${err}`));
        };

        img.src = src;
    });
};

export const compressImageFromFile = async (
    file: File,
    options: CompressionOptions = {},
) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            if (!e.target || typeof e.target.result !== "string") {
                reject(new Error("读取文件失败：文件可能不存在？"));
                return;
            }
            try {
                const compressedBase64 = await compressImage(e.target.result, options);
                resolve(compressedBase64);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            const err = reader.error;
            if (err) {
                reject(new Error(`文件读取失败： ${err.message}`));
            } else {
                reject(new Error("文件读取失败：未知错误"));
            }
        };

        reader.readAsDataURL(file);
    });
};