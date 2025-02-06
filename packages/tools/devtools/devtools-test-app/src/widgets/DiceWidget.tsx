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
		<div className="flex flex-row gap-3 justify-center flex-wrap w-full h-full">
			<div className="flex flex-col gap-3 justify-center content-center m-4">
				<VisualDie diceRoller={diceRoller} />
				<RollButton diceRoller={diceRoller} />
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
		// color: `hsl(${parseInt(props.diceRoller.value, 10) * 60}, 70%, 50%)`,
		color: `hsl(${diceRoller.value * 60}, 70%, 50%)`,
		fontSize: "200px",
	};

	// Unicode 0x2680-0x2685 are the sides of a dice (⚀⚁⚂⚃⚄⚅)
	return (
		<div style={divStyle}>
			{String.fromCodePoint((0x267f + diceRoller.value) as unknown as number)}
		</div>
	);
}

/**
 * TODO
 */
export function RollButton(props: VisualDieProps): JSX.Element {
	const { diceRoller } = props;

	return (
		<button
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
			onClick={() => diceRoller.roll()}
		>
			Roll
		</button>
	);
}
