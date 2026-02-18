export const customResponse = (app: any) =>
	app.decorate("res", {
		success: (data: any = {}, options: any = {}) => {
			const { statusCode = 200, message = "success" } = options;

			return {
				statusCode,
				message,
				...data,
			};
		},
		fail: (message: string = "failed", options: any = {}) => {
			const { statusCode = 400 } = options;

			return {
				statusCode,
				message,
			};
		},
	});
