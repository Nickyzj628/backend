import { toast } from "react-hot-toast/headless";
import { to } from "./network";

/**
 * 设置页面标题
 * @param title 页面标题
 * @example
 * setTitle("主页"); // 页面标题为 "主页 / NICKYZJ"
 * setTitle(); // 页面标题为默认的 "NICKYZJ"
 */
export const setTitle = (title?: string) => {
    const logo = "NICKYZJ";
    if (!title) {
        document.title = logo;
    } else {
        document.title = `${title} / ${logo}`;
    }
};

/**
 * 给图片添加点击缩放交互
 * @param dom 要添加交互的图片元素
 * @example
 * const element = document.getElementById("image");
 * zoom(element); // 点击 #image 后展开图片
 */
export const zoom = async (dom: HTMLImageElement) => {
    const { default: mediumZoom } = await import("medium-zoom");
    mediumZoom(dom, {
        margin: 30,
        background: "rgba(0, 0, 0, 0.8)",
    });
};

/**
 * 递归收集一个元素及其内部，所有特定标签的元素
 * @param element 要收集的元素
 * @param tagName 要收集的标签名
 * @returns 所有特定标签的元素
 * @example
 * const element = document.getElementById("root");
 * const divs = getChildrenByTag(element, "div");
 * console.log(divs); // 输出 #root 下的所有 div 元素
 */
export const getChildrenByTag = <K extends keyof HTMLElementTagNameMap>(
    element: Element,
    tagName: K,
): HTMLElementTagNameMap[K][] => {
    const elements: HTMLElementTagNameMap[K][] = [];

    if (element.tagName === tagName.toUpperCase()) {
        elements.push(element as HTMLElementTagNameMap[K]);
    }

    // 递归遍历子元素
    Array.from(element.children).forEach((child) => {
        elements.push(...getChildrenByTag(child, tagName));
    });

    return elements;
};

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @example
 * copyToClipboard("Hello, world!"); // 复制 "Hello, world!" 到剪贴板
 */
export const copyToClipboard = async (text: string) => {
    // 如果浏览器不支持 Clipboard API，则使用旧方法
    if (!navigator.clipboard) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed"; // 防止页面滚动

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const done = document.execCommand("copy");
        toast.success(done ? "复制成功" : "复制失败，请手动复制");
        document.body.removeChild(textarea);
    } else {
        const [error] = await to(navigator.clipboard.writeText(text));
        if (error) {
            toast.error(`复制失败：${error.message}`);
        } else {
            toast.success("复制成功");
        }
    }
};
