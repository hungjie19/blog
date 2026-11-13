import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { render } from "pele";

// ```mermaid fence → <figure class="mermaid-diagram"><svg class="pele …"></figure>，build time 由 Pele 渲染，讀者端不載 JS。
// remark 階段就換掉，Expressive Code（rehype）看不到這個 code block。
// 顏色吃 --pele-* 變數，對應在 global.css 的 .mermaid-diagram；燈箱在 [slug].astro。
export const remarkMermaid: Plugin<[], Root> = () => (tree, file) => {
	let count = 0;
	visit(tree, "code", (node, index, parent) => {
		if (node.lang !== "mermaid" || !parent || index === undefined) return;

		// SVG 內的 marker / clipPath id 是全頁共用的，同頁多張圖要各自加前綴
		const idPrefix = `mermaid-${count++}-`;
		let svg = "";
		try {
			({ svg } = render(node.value, { idPrefix }));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			// 語法錯直接讓 build 失敗，並指出是哪個檔案第幾行
			file.fail(`Mermaid 渲染失敗：${message}`, node);
		}

		parent.children[index] = { type: "html", value: `<figure class="mermaid-diagram">${svg}</figure>` };
	});
};
