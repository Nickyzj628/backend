import dayjs, { ConfigType } from "dayjs";
import { removeSpaces } from "./string";

/**
 * 延迟一段时间再执行后续代码
 * @param time 延迟时间，默认 150ms
 * @example
 * await sleep(1000); // 等待 1 秒执行后续代码
 */
export const sleep = async (time = 150) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

/**
 * 延迟一定帧数后执行后续代码
 * @param frames 延迟的帧数，默认1帧
 * @example
 * await delayFrames(10); // 等待 10 帧执行后续代码
 */
export const delayFrames = async (frames = 1) => {
    return new Promise((resolve) => {
        let frameCount = 0;

        const run = () => {
            frameCount++;
            if (frameCount >= frames) {
                resolve(void 0);
            } else {
                requestAnimationFrame(run);
            }
        };

        requestAnimationFrame(run);
    });
};

/**
 * 防抖，使传入的函数距离上次调用一段时间后再执行
 * @param fn 要防抖的函数
 * @param time 防抖时间，默认 150ms
 * @example
 * const debounceFn = debounce(() => {
 *     console.log("防抖函数执行");
 * }, 1000);
 * debounceFn();
 * debounceFn();
 * debounceFn(); // 等待 1 秒执行
 */
export const debounce = (fn: (...args: any[]) => void, time = 150) => {
    let timer: NodeJS.Timeout;

    return (...args: any[]) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => fn(...args), time);
    };
};

/**
 * 节流，使传入的函数在一段时间内只执行一次
 * @param fn 要节流的函数
 * @param ms 节流时间，默认 150ms
 * @example
 * const throttleFn = throttle(() => {
 *     console.log("节流函数执行");
 * }, 1000);
 * throttleFn(); // 等待 1 秒执行
 * throttleFn();
 * throttleFn(); 
 */
export const throttle = (fn: (...args: any[]) => void, ms = 150) => {
    let timer: NodeJS.Timeout;

    return async (...args: any[]) => {
        if (timer) {
            return;
        }
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, ms);
    };
};

/**
 * 获取当前时间段
 * @example
 * getPeriod(); // "晚上"
 */
export const getPeriod = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "凌晨";
    if (hour >= 6 && hour <= 8) return "早上";
    if (hour >= 9 && hour <= 11) return "上午";
    if (hour === 12) return "中午";
    if (hour >= 13 && hour <= 17) return "下午";
    if (hour >= 18 && hour <= 19) return "傍晚";
    return "晚上";
};

/**
 * 计算给定时间距离现在有多久（语义化）
 * @param date dayjs 支持的时间格式
 * @example
 * fromNow("2023-01-01"); // "1天前"
 */
export const fromNow = (date: ConfigType) => {
    return removeSpaces(dayjs(date).fromNow());
};
