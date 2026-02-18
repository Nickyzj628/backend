import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { textToSlug } from "./common";

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
export const renderMarkdown = async (md: string) => {
	await initHighlighter();
	return Bun.markdown.render(
		md,
		{
			// ========== Block Callbacks ==========

			// 标题
			heading: (children, { level, id }) => {
				const uniqueId = `${textToSlug(children)}${id || ""}`;
				return `<h${level} id="${uniqueId}">${children}</h${level}>`;
			},

			// 段落
			paragraph: (children) => `<p>${children}</p>`,

			// 引用块
			blockquote: (children) => `<blockquote>${children}</blockquote>`,

			// 代码块
			code: (children, meta) => {
				const lang = meta?.language || "text";
				if (highlighter) {
					try {
						const themes = highlighter.getLoadedThemes();
						return highlighter.codeToHtml(children, {
							lang,
							theme: themes[0],
						});
					} catch {
						return `<pre><code class="language-${lang}">${children}</code></pre>`;
					}
				}
				return `<pre><code class="language-${lang}">${children}</code></pre>`;
			},

			// 列表
			list: (children, { ordered, start }) => {
				if (ordered) {
					const startAttr = start && start !== 1 ? ` start="${start}"` : "";
					return `<ol${startAttr}>${children}</ol>`;
				}
				return `<ul>${children}</ul>`;
			},

			// 列表项
			listItem: (children, meta) => {
				if (meta?.checked !== undefined) {
					const checkbox = `<input type="checkbox" disabled ${meta.checked ? "checked" : ""} /> `;
					return `<li>${checkbox}${children}</li>`;
				}
				return `<li>${children}</li>`;
			},

			// 水平线
			hr: () => "<hr />",

			// 表格
			table: (children) => `<table>${children}</table>`,
			thead: (children) => `<thead>${children}</thead>`,
			tbody: (children) => `<tbody>${children}</tbody>`,
			tr: (children) => `<tr>${children}</tr>`,
			th: (children, meta) => {
				const alignAttr = meta?.align ? ` align="${meta.align}"` : "";
				return `<th${alignAttr}>${children}</th>`;
			},
			td: (children, meta) => {
				const alignAttr = meta?.align ? ` align="${meta.align}"` : "";
				return `<td${alignAttr}>${children}</td>`;
			},

			// 原始 HTML 块
			html: (children) => children,

			// ========== Inline Callbacks ==========

			// 强调
			strong: (children) => `<strong>${children}</strong>`,
			emphasis: (children) => `<em>${children}</em>`,

			// 删除线
			strikethrough: (children) => `<del>${children}</del>`,

			// 链接
			link: (children, { href, title }) => {
				const titleAttr = title ? ` title="${title}"` : "";
				return `<a href="${href}"${titleAttr}>${children}</a>`;
			},

			// 图片
			image: (children, { src, title }) => {
				const titleAttr = title ? ` title="${title}"` : "";
				return `<img src="${src}" alt="${children}"${titleAttr} />`;
			},

			// 行内代码
			codespan: (children) => `<code>${children}</code>`,

			// 纯文本
			text: (children) => children,
		},
		{
			headings: {
				ids: true,
			},
		},
	);
};
