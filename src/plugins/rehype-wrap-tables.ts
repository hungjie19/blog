import { h } from "hastscript";
import { SKIP, visit } from "unist-util-visit";
import type { Root } from "hast";
import type { Plugin } from "unified";

// table-layout:auto 的 <table> 在內容需要更寬時會撐開超過自己宣告的 width，
// 這時 table 自己身上的 overflow-x:auto 沒用（它的 box 已經撐大，沒東西溢出）。
// 包一層 div 再設 overflow-x:auto，div 沒有這種自動撐寬規則，才能真的把
// 橫向溢出限制在 table 本身，而不是讓整個內容區被撐開捲動。
export const rehypeWrapTables: Plugin<[], Root> = () => (tree) => {
	visit(tree, "element", (node, index, parent) => {
		if (node.tagName !== "table" || !parent || typeof index !== "number") return;
		parent.children[index] = h("div", { class: "table-scroll" }, [node]);
		return [SKIP, index + 1];
	});
};
