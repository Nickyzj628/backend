import { presetWind4 } from "@unocss/preset-wind4";
import transformerDirectives from "@unocss/transformer-directives";
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
	transformers: [transformerDirectives()],
	shortcuts: {
		bento: "p-3 bg-white rounded-xl transition dark:bg-neutral-900",
		divider:
			"w-0.5 h-6 bg-neutral-200/60 rounded-full transition dark:bg-neutral-700/60",
		badge:
			"px-2.5 py-0.5 text-xs text-neutral-800 bg-neutral-100 rounded-full transition dark:(text-neutral-100 bg-neutral-800)",
	},
	preflights: [
		{
			getCSS: () => `
				/* 滚动条 */
				::-webkit-scrollbar {
					width: 16px;
					background: transparent;
				}
				::-webkit-scrollbar-thumb {
					border: 4px solid transparent;
					border-radius: 9999px;
					background-clip: content-box;
					background-color: rgba(163, 163, 163, 0.6);
				}
				::-webkit-scrollbar-thumb:hover {
					background-color: rgb(163, 163, 163);
				}

				/* 交互体验优化 */
				html {
					-webkit-tap-highlight-color: transparent;
					touch-action: manipulation;
					scroll-behavior: smooth;
				}

				/* 标题样式 */
				h1 { font-size: 1.875rem; }
				h2 { font-size: 1.5rem; }
				h3 { font-size: 1.25rem; }
				h4 { font-size: 1.125rem; }
				h5 { font-size: 1rem; }
				h6 { font-size: 0.875rem; }
				h1, h2, h3, h4, h5, h6 {
					color: #000;
					transition: color 0.15s ease;
				}
				.dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
					color: rgb(229, 229, 229);
				}

				/* 多媒体 */
				img {
					object-fit: cover;
					transition: filter 0.15s ease;
				}
				.dark img {
					filter: brightness(0.9);
				}
				video {
					object-fit: contain;
					outline: none;
					border-radius: 0.75rem;
					overflow: hidden;
				}

				/* 交互元素 */
				a {
					transition: transform 0.15s ease;
				}
				a:active {
					transform: scale(0.95);
				}
				button {
					outline: none;
					cursor: pointer;
					transition: transform 0.15s ease;
				}
				button:active {
					transform: scale(0.95);
				}

				/* 水平分割线 */
				hr {
					margin: 1rem 0;
					border: 1px solid rgb(245, 245, 245);
					border-radius: 9999px;
					transition: border-color 0.15s ease;
				}
				.dark hr {
					border-color: rgb(38, 38, 38);
				}

				/* 表格相关 */
				th {
					white-space: nowrap;
				}

				/* 文章相关 */
				blockquote, ::marker {
					transition: color 0.15s ease;
				}
			`,
		},
	],
});
