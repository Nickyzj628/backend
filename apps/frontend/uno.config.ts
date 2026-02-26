import { readFile } from "node:fs/promises";
import { presetWind4 } from "@unocss/preset-wind4";
import { defineConfig, presetIcons, presetTypography } from "unocss";

export default defineConfig({
	content: {
		filesystem: ["src/**/*.{html,ts,tsx}"],
	},
	presets: [
		presetWind4(),
		presetIcons({
			scale: 1.2,
		}),
		presetTypography(),
	],
	preflights: [
		{
			layer: "override",
			getCSS: async () => await readFile("src/assets/override.css", "utf-8"),
		},
	],
	layers: {
		override: 9999,
	},
	shortcuts: {
		bento: "p-3 bg-white rounded-xl transition dark:bg-neutral-900",
		divider:
			"w-0.5 h-6 bg-neutral-200/60 rounded-full transition dark:bg-neutral-700/60",
	},
});
