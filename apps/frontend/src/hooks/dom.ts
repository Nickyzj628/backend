import { getChildrenByTag, zoom } from "@/helpers/dom";
import { MutableRef, useCallback, useEffect, useState } from "preact/hooks";

/**
 * 更可靠的 DOM 引用保存方式，可以避免提前返回导致 ref.current 容易读到 null 的问题
 * @example
 * const [initRef, ref] = useEnsuredRef<HTMLDivElement>();
 * const {isLoading, data} = useRequest("/some-api");
 * useEffect(() => {
 *     // 先打印 null，再打印 div 元素
 *     console.log(ref.current);
 * }, [ref]);
 * if (isLoading) {
 *     return "loading...";
 * }
 * return <div ref={initRef} />
 */
export const useEnsuredRef = <T extends HTMLElement>() => {
    const [ref, setRef] = useState<{ current: T | null }>({ current: null });

    const initRef = useCallback((node: T | null) => {
        setRef({ current: node });
    }, []);

    return [initRef, ref] as const;
};

/**
 * 获取元素宽高
 * @example
 * const [initRef, ref] = useEnsuredRef<HTMLDivElement>();
 * const { width, height } = useSize(ref);
 * return <div ref={initRef} />
 */
export const useSize = (ref: MutableRef<HTMLElement | null>) => {
    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        const updateSize = () => {
            const rect = element.getBoundingClientRect();
            setSize({
                width: parseFloat(rect.width.toFixed(2)),
                height: parseFloat(rect.height.toFixed(2)),
            });
        };
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(element);
        updateSize();

        return () => {
            resizeObserver.disconnect();
        };
    }, [ref]);

    return size;
};

/**
 * 将元素的鼠标上下滚轮事件改为左右滚动
 * @example
 * const [initRef, ref] = useEnsuredRef<HTMLDivElement>();
 * useScrollX(ref);
 * return <div ref={initRef} />
 */
export const useScrollX = (ref: MutableRef<HTMLElement | null>) => {
    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        const onWheel = (e: WheelEvent) => {
            if (element.scrollWidth <= element.clientWidth || e.deltaX !== 0) {
                return;
            }
            e.preventDefault();
            element.scrollBy(e.deltaY, 0);
        };
        element.style.scrollBehavior = "smooth";
        element.addEventListener("wheel", onWheel);

        return () => {
            element.removeEventListener("wheel", onWheel);
        };
    }, [ref]);
};

/**
 * 给 ref 下的所有图片添加缩放交互。不需要交互的图片请加上 .no-zoom
 * @example
 * const [initRef, ref] = useEnsuredRef<HTMLDivElement>();
 * useZoom(ref);
 * return (
 *     <div ref={initRef}>
 *         <img src="..." />
 *         <img src="..." />
 *         <img src="..." class="no-zoom" />
 *     </div>
 * );
 */
export const useZoom = (ref: MutableRef<HTMLElement | null>) => {
    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        const ob = new MutationObserver((entries) => {
            const images: HTMLImageElement[] = [];

            // 收集所有需要添加交互的图片
            entries.forEach((entry) => {
                const nodes = entry.addedNodes;
                if (nodes.length === 0) {
                    return;
                }
                nodes.forEach((node) => {
                    if (!(node instanceof Element)) {
                        return;
                    }
                    // 收集节点内所有还未添加交互，且未添加 .no-zoom 的图片
                    const imagesInNode = getChildrenByTag(node, "img");
                    imagesInNode.forEach((image) => {
                        if (image.classList.contains("medium-zoom-image") || image.classList.contains("no-zoom")) {
                            return;
                        }
                        images.push(image);
                    });
                });
            });

            // 在图片加载完成后添加交互
            images.forEach((image) => {
                image.onload = () => {
                    zoom(image);
                };
            });
        });

        // 立即添加一次交互
        element.querySelectorAll("img:not(.medium-zoom-image, .no-zoom)").forEach((child: HTMLImageElement) => {
            zoom(child);
        });

        // 启动观察器，持续对容器内的新图片添加缩放交互
        ob.observe(element, {
            subtree: true,
            childList: true,
        });

        return () => {
            ob.disconnect();
        };
    }, [ref]);
};
