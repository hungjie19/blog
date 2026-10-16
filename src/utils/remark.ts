import { h as _h, type Properties } from "hastscript";
import type { Paragraph as P } from "mdast";

declare module "mdast" {
	interface Data {
		hName?: string;
		hProperties?: Properties;
	}
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
