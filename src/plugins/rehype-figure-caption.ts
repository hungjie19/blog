import { h } from "hastscript";
import type { Element, ElementContent, Root } from "hast";
import rehypeRaw from "rehype-raw";
import type { Plugin } from "unified";

const parseRaw = rehypeRaw();

function isImageParagraph(node: Element): Element | undefined {
	if (node.tagName !== "p") return undefined;
	const img = node.children.find(
		(child: ElementContent): child is Element => child.type === "element" && child.tagName === "img",
	);
	return img;
}

function isCaptionParagraph(node: Element): boolean {
	if (node.tagName !== "p") return false;
	const className = node.properties?.className;
	return Array.isArray(className) && className.includes("image-caption");
}

function isBlankText(node: Root["children"][number]): boolean {
	return node.type === "text" && node.value.trim() === "";
}

// 把「圖片段落 緊接著 .image-caption 段落」的手寫慣例，合併成 <figure>/<figcaption>
// 手寫的 <p class="image-caption"> 在這個階段還是 hast 的 raw 節點（未解析的 HTML 字串），
// 要先用 rehype-raw 解析成真正的 element，才能比對 class。
// block-level 節點之間 hast 會插入換行用的 whitespace text node，比對「下一個」時要跳過。
export const rehypeFigureCaption: Plugin<[], Root> = () => (tree, file) => {
	const parsed = parseRaw(tree, file);

	for (let i = parsed.children.length - 1; i >= 0; i--) {
		const node = parsed.children[i];
		if (node?.type !== "element") continue;

		let j = i + 1;
		while (j < parsed.children.length && isBlankText(parsed.children[j])) j++;
		const next = parsed.children[j];
		if (next?.type !== "element") continue;

		const img = isImageParagraph(node);
		if (!img || !isCaptionParagraph(next)) continue;

		const figure = h("figure", { class: "image-figure" }, [
			img,
			h("figcaption", { class: "image-caption" }, next.children),
		]);

		parsed.children.splice(i, j - i + 1, figure);
	}

	return parsed;
};
