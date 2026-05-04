import { marked } from "marked";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import dracula from "shiki/themes/dracula.mjs";
import { textToSlug } from "../common";

const shiki = createHighlighterCoreSync({
	themes: [dracula],
	langs: [html, css, javascript, typescript, tsx, json],
	engine: createJavaScriptRegexEngine(),
});

/**
 * 将 Markdown 渲染为 HTML
 */
export const renderMarkdown = async (md: string): Promise<string> => {
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
		try {
			const themes = shiki.getLoadedThemes();
			const result = shiki.codeToHtml(code, {
				lang,
				theme: themes[0],
			});
			return result;
		} catch {
			return `<pre><code class="language-${lang}">${code}</code></pre>`;
		}
	};

	marked.setOptions({
		renderer,
		gfm: true,
	});

	return marked(md);
};
