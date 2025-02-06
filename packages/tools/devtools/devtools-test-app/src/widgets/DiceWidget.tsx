/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Tree, type TreeView } from "@fluidframework/tree";
import React, { useEffect, useState } from "react";

import type { DiceRoller } from "../FluidObject.js";

/**
 * Props for the DiceWidget component.
 */
export interface DiceWidgetProps {
	tree: TreeView<typeof DiceRoller>;
}

/**
 * TODO
 */
export function DiceWidget(props: DiceWidgetProps): JSX.Element {
	const { tree } = props;

	const [invalidations, setInvalidations] = useState(0);

	const diceRoller = tree.root;

	console.log(diceRoller);

	// Register for tree deltas when the component mounts.
	// Any time the tree changes, the app will update.
	useEffect(() => {
		const unsubscribe = Tree.on(diceRoller, "treeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, [diceRoller, invalidations]);

	return (
		<div className="flex flex-col gap-3 justify-center items-center w-full p-[100px] relative">
			<div className="flex justify-center items-center">
				<VisualDie diceRoller={diceRoller} />
			</div>
		</div>
	);
}

interface VisualDieProps {
	diceRoller: DiceRoller;
}

/**
 * TODO
 */
export function VisualDie(props: VisualDieProps): JSX.Element {
	const { diceRoller } = props;

	const divStyle = {
		fontSize: "200px",
		cursor: "pointer",
	};

	return (
		<div style={divStyle} onClick={() => diceRoller.roll()}>
			{String.fromCodePoint((0x267f + diceRoller.value) as unknown as number)}
		</div>
	);
}
