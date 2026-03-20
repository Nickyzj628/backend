/**
 * UI 组件相关类型
 */

/**
 * Toast 消息通知
 */
export type Toast = {
  id: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
  duration?: number;
  lifecycle?: "beforeEnter" | "entered" | "beforeExit";
};
