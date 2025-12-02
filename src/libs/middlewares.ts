import type { RequestHandler } from "express";

/** 自定义 success 和 fail 方法 */
export const customResponse: () => RequestHandler = () => (req, res, next) => {
	res.success = (data = {}, options = {}) => {
		const { statusCode = 200, message = "success" } = options;

		res.json({
			statusCode,
			message,
			...data,
		});
	};

	res.fail = (message = "failed", options = {}) => {
		const { statusCode = 400 } = options;

		res.json({
			statusCode,
			message,
		});
	};

	next();
};
