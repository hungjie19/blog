import { h } from "hastscript";
import type { Element, ElementContent, Root } from "hast";
import rehypeRaw from "rehype-raw";
import type { Plugin } from "unified";

// MDX 文章會含 import 與 Astro component 節點；rehype-raw 處理手寫 caption
// 時必須保留它們，否則會因 mdxjsEsm node 無法編譯而中斷。
const parseRaw = rehypeRaw({
	passThrough: [
		"mdxjsEsm",
		"mdxFlowExpression",
		"mdxTextExpression",
		"mdxJsxFlowElement",
		"mdxJsxTextElement",
	],
});

function isImageParagraph(node: Element): Element | undefined {
	if (node.tagName !== "p") return undefined;
	const img = node.children.find(
		(child: ElementContent): child is Element => child.type === "element" && child.tagName === "img",
	);
	return img;
}

type RootChild = Root["children"][number];

// MDX 會把手寫的 <p class="image-caption"> 解析成 JSX 節點，而不是 hast element。
interface MdxJsxFlowElement {
	type: "mdxJsxFlowElement";
	name: string | null;
	attributes: Array<{ type: string; name?: string; value?: unknown }>;
	children: ElementContent[];
}

function isMdxJsxFlowElement(node: unknown): node is MdxJsxFlowElement {
	return (node as { type?: string } | undefined)?.type === "mdxJsxFlowElement";
}

// 回傳 caption 的子節點；不是 caption 段落時回傳 undefined。
// .md 文章經 rehype-raw 後是 element；.mdx 文章是 mdxJsxFlowElement，兩種都要認。
function getCaptionChildren(node: RootChild | undefined): ElementContent[] | undefined {
	if (node?.type === "element") {
		if (node.tagName !== "p") return undefined;
		const className = node.properties?.className;
		return Array.isArray(className) && className.includes("image-caption") ? node.children : undefined;
	}
	const jsx: unknown = node;
	if (isMdxJsxFlowElement(jsx)) {
		if (jsx.name !== "p") return undefined;
		const classAttr = jsx.attributes.find(
			(attr) => attr.type === "mdxJsxAttribute" && (attr.name === "class" || attr.name === "className"),
		);
		const classes = typeof classAttr?.value === "string" ? classAttr.value.split(/\s+/) : [];
		return classes.includes("image-caption") ? jsx.children : undefined;
	}
	return undefined;
}

// caption 內容換行寫成多行時，MDX 會在 JSX 裡自動包一層 <p>；這是排版不是標記，拆掉只留內容。
function unwrapImplicitParagraph(children: ElementContent[]): ElementContent[] {
	const meaningful = children.filter((child) => !(child.type === "text" && child.value.trim() === ""));
	if (meaningful.length === 1 && meaningful[0].type === "element" && meaningful[0].tagName === "p") {
		return meaningful[0].children;
	}
	return children;
}

function isBlankText(node: RootChild | undefined): boolean {
	return node?.type === "text" && node.value.trim() === "";
}

// 把「圖片段落 緊接著 .image-caption 段落」的手寫慣例，合併成 <figure>/<figcaption>
// .md 文章的手寫 caption 在這個階段是 hast 的 raw 節點，要先用 rehype-raw 解析成 element；
// .mdx 文章的 caption 則已經是 mdxJsxFlowElement（rehype-raw 透過 passThrough 原樣保留）。
// block-level 節點之間 hast 會插入換行用的 whitespace text node，比對「下一個」時要跳過。
// caption 只能是純文字（燈箱也只讀 textContent），含任何標籤就讓 build 失敗。
export const rehypeFigureCaption: Plugin<[], Root> = () => (tree, file) => {
	const parsed = parseRaw(tree, file);

	for (let i = parsed.children.length - 1; i >= 0; i--) {
		const node = parsed.children[i];
		if (node?.type !== "element") continue;

		let j = i + 1;
		while (j < parsed.children.length && isBlankText(parsed.children[j])) j++;

		const img = isImageParagraph(node);
		const rawCaption = getCaptionChildren(parsed.children[j]);
		if (!img || !rawCaption) continue;
		const captionChildren = unwrapImplicitParagraph(rawCaption);

		const nonText = captionChildren.filter((child) => child.type !== "text");
		if (nonText.length) {
			const tags = nonText.map((child) => (child.type === "element" ? `<${child.tagName}>` : child.type));
			const text = captionChildren.map((child) => (child.type === "text" ? child.value : "…")).join("").trim();
			file.fail(
				`image-caption 只能是純文字，發現 ${tags.join(", ")}（反引號、連結、裸網址都會變成標籤）：${text.slice(0, 60)}`,
			);
		}

		const figure = h("figure", { class: "image-figure" }, [
			img,
			h("figcaption", { class: "image-caption" }, captionChildren),
		]);

		parsed.children.splice(i, j - i + 1, figure);
	}

	return parsed;
};
