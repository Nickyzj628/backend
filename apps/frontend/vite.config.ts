import path from "node:path";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		tailwindcss(),
		visualizer({
			open: true,
			gzipSize: true,
			filename: "dist/stats.html",
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	optimizeDeps: {
		include: ["nano-css/addon/vcssom"],
	},
	build: {
		// outDir: "./dist",
		outDir: "D:/nginx/html",
		emptyOutDir: true,
	},
});
