import { useMedia } from "react-use";

const MOBILE_BREAKPOINT = 576;

/**
 * 检测当前视口是否为移动端尺寸
 * @returns 如果视口宽度 <= 576px 返回 true，否则返回 false
 */
export const useIsMobile = () => {
	const isMobile = useMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
	return isMobile;
};
