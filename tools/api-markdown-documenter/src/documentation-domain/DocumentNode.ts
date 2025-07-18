/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Parent as UnistParent } from "unist";

import type { ApiItem } from "../index.js";

import type { SectionNode } from "./SectionNode.js";

/**
 * {@link DocumentNode} construction properties.
 *
 * @public
 */
export interface DocumentNodeProperties {
	/**
	 * The ApiItem the document node was created for, if it was created for an ApiItem.
	 */
	readonly apiItem?: ApiItem;

	/**
	 * Child nodes.
	 *
	 * @see {@link https://github.com/syntax-tree/unist#parent}.
	 */
	readonly children: SectionNode[];

	/**
	 * Path to which the resulting document should be saved.
	 *
	 * @remarks Does not include the file extension, as this domain has no concept of what kind of file will be produced.
	 */
	readonly documentPath: string;
}

/**
 * Represents the root of a document.
 *
 * @remarks
 *
 * Note that this node is special.
 * It forms the root of a Documentation tree, and cannot be parented under other {@link DocumentationNode}s.
 *
 * @sealed
 * @public
 */
export class DocumentNode implements UnistParent<SectionNode>, DocumentNodeProperties {
	/**
	 * {@inheritDoc DocumentationNode."type"}
	 */
	public readonly type = "document";

	/**
	 * {@inheritDoc DocumentNodeProps.apiItem}
	 */
	public readonly apiItem?: ApiItem;

	/**
	 * {@inheritDoc DocumentNodeProps.children}
	 */
	public readonly children: SectionNode[];

	/**
	 * {@inheritDoc DocumentNodeProps.documentPath}
	 */
	public readonly documentPath: string;

	public constructor(properties: DocumentNodeProperties) {
		this.apiItem = properties.apiItem;
		this.children = properties.children;
		this.documentPath = properties.documentPath;
	}
}
