import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { h } from "../utils/remark";

type AdmonitionType = "tip" | "note" | "important" | "caution" | "warning";

const Admonitions = new Set<AdmonitionType>(["tip", "note", "important", "caution", "warning"]);

function isAdmonition(s: string): s is AdmonitionType {
	return Admonitions.has(s as AdmonitionType);
}

// GitHub alert syntax: a blockquote whose first line is `[!TIP]`, `[!NOTE]`, etc.
const ALERT_MARKER = /^\[!(\w+)\][ \t]*(?:\r?\n|$)/;

export const remarkAdmonitions: Plugin<[], Root> = () => (tree) => {
	visit(tree, "blockquote", (node, index, parent) => {
		if (!parent || index === undefined) return;

		const firstParagraph = node.children[0];
		if (firstParagraph?.type !== "paragraph") return;
		const firstText = firstParagraph.children[0];
		if (firstText?.type !== "text") return;

		const match = firstText.value.match(ALERT_MARKER);
		if (!match) return;
		const admonitionType = match[1].toLowerCase();
		if (!isAdmonition(admonitionType)) return;

		firstText.value = firstText.value.slice(match[0].length);
		if (!firstText.value) firstParagraph.children.shift();
		if (!firstParagraph.children.length) node.children.shift();

		const admonition = h(
			"aside",
			{ "aria-label": admonitionType, class: "admonition", "data-admonition-type": admonitionType },
			[
				h("p", { class: "admonition-title", "aria-hidden": "true" }, [{ type: "text", value: admonitionType }]),
				h("div", { class: "admonition-content" }, node.children),
			],
		);

		parent.children[index] = admonition;
	});
};
