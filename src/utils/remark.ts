import { h as _h, type Properties } from "hastscript";
import type { Node, Paragraph as P } from "mdast";
import type { Directives } from "mdast-util-directive";

declare module "mdast" {
	interface Data {
		hName?: string;
		hProperties?: Properties;
	}
}

export function isNodeDirective(node: Node): node is Directives {
	return (
		node.type === "containerDirective" ||
		node.type === "leafDirective" ||
		node.type === "textDirective"
	);
}

// biome-ignore lint/suspicious/noExplicitAny: allow hast-compatible children
export function h(el: string, attrs: Properties = {}, children: any[] = []): P {
	const { properties, tagName } = _h(el, attrs);
	return {
		children,
		data: { hName: tagName, hProperties: properties },
		type: "paragraph",
	};
}
