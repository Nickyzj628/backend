import { textToSlug } from "./common";

// Shiki 高亮器实例
// const highlighter = await createHighlighterCore({
// 	themes: [import("@shikijs/themes/gruvbox-light-medium")],
// 	langs: [
// 		import("@shikijs/langs-precompiled/html"),
// 		import("@shikijs/langs-precompiled/css"),
// 		import("@shikijs/langs-precompiled/javascript"),
// 		import("@shikijs/langs-precompiled/typescript"),
// 		import("@shikijs/langs-precompiled/json"),
// 	],
// 	engine: createJavaScriptRawEngine(),
// });

// 转义 HTML 特殊字符
const escapeHtml = (text: string) => {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

/**
 * 将 Markdown 渲染为 HTML
 */
export const renderMarkdown = async (md: string) => {
	return Bun.markdown.render(md, {
		// ========== Block Callbacks ==========

		// 标题
		heading: (children, { level }) => {
			return `<h${level} id="${textToSlug(children)}">${children}</h${level}>`;
		},

		// 段落
		paragraph: (children) => `<p>${children}</p>`,

		// 引用块
		blockquote: (children) => `<blockquote>${children}</blockquote>`,

		// 代码块
		code: (children, meta) => {
			const lang = meta?.language || "text";
			// try {
			// 	return highlighter.codeToHtml(children, {
			// 		lang,
			// 		theme: "catppuccin-frappe",
			// 	});
			// } catch {
			// 	return `<pre><code class="language-${lang}">${escapeHtml(children)}</code></pre>`;
			// }
			return `<pre><code class="language-${lang}">${escapeHtml(children)}</code></pre>`;
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
			const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
			return `<a href="${escapeHtml(href)}"${titleAttr}>${children}</a>`;
		},

		// 图片
		image: (children, { src, title }) => {
			const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
			return `<img src="${escapeHtml(src)}" alt="${children}"${titleAttr} />`;
		},

		// 行内代码
		codespan: (children) => `<code>${escapeHtml(children)}</code>`,

		// 纯文本
		text: (children) => escapeHtml(children),
	});
};
