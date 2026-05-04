import path from "node:path";
import preact from "@preact/preset-vite";
import unocss from "@unocss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const isDev = mode === "development";
	const outDir = isDev ? "./dist" : "D:/nginx/html";

	return {
		plugins: [
			unocss(),
			preact(),
			visualizer({
				open: false,
				gzipSize: true,
				filename: `${outDir}/stats.html`,
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
		build: {
			outDir,
			emptyOutDir: true,
		},
	};
});
