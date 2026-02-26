import { marked } from "marked";
import {
	codeToHtml,
	createHighlighterCore,
	type HighlighterCore,
} from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { textToSlug } from "../common";

let highlighter: HighlighterCore | null = null;
let initPromise: Promise<HighlighterCore> | null = null;

const initHighlighter = async () => {
	if (highlighter) {
		return highlighter;
	}

	// 使用 Promise 锁，防止并发创建多个实例
	if (!initPromise) {
		initPromise = createHighlighterCore({
			themes: [import("shiki/themes/dracula.mjs")],
			langs: [
				import("shiki/langs/html.mjs"),
				import("shiki/langs/css.mjs"),
				import("shiki/langs/javascript.mjs"),
				import("shiki/langs/typescript.mjs"),
				import("shiki/langs/json.mjs"),
			],
			engine: createJavaScriptRegexEngine(),
		}).then((h) => {
			highlighter = h;
			return h;
		});
	}

	return initPromise;
};

/**
 * 将 Markdown 渲染为 HTML
 */
export const renderMarkdown = async (md: string): Promise<string> => {
	const h = await initHighlighter();

	const renderer = new marked.Renderer();

	// 自定义标题渲染，添加 ID
	renderer.heading = (token) => {
		const text = token.text;
		const level = token.depth;
		const uniqueId = textToSlug(text);
		return `<h${level} id="${uniqueId}">${text}</h${level}>`;
	};

	// 自定义代码块渲染，使用 Shiki
	renderer.code = (token) => {
		const code = token.text;
		const lang = token.lang || "text";
		if (h) {
			try {
				const themes = h.getLoadedThemes();
				// @ts-expect-error - shiki API compatibility
				return codeToHtml(code, {
					lang,
					theme: themes[0],
				});
			} catch {
				return `<pre><code class="language-${lang}">${code}</code></pre>`;
			}
		}
		return `<pre><code class="language-${lang}">${code}</code></pre>`;
	};

	marked.setOptions({
		renderer,
		gfm: true,
	});

	return marked(md);
};
