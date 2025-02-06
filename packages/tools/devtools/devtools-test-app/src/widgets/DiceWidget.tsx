/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ITree, TreeViewConfiguration } from "@fluidframework/tree";
import React from "react";

/**
 * TODO
 */
export interface DiceWidgetProps {
	tree: ITree;
	config: TreeViewConfiguration;
}

/**
 * TODO
 */
export function DiceWidget(props: DiceWidgetProps): JSX.Element {
	const { tree, config } = props;

	// const [invalidations, setInvalidations] = useState(0);

	const treeView = tree.viewWith(config);
	const diceRoller = treeView.root;

	console.log(diceRoller);

	// Register for tree deltas when the component mounts.
	// Any time the tree changes, the app will update.
	// useEffect(() => {
	// 	const unsubscribe = treeView.on("rootChanged", () => {
	// 		setInvalidations(invalidations + Math.random());
	// 	});
	// 	return unsubscribe;
	// }, []);

	return (
		<div className="flex flex-row gap-3 justify-center flex-wrap w-full h-full">
			<div className="flex flex-col gap-3 justify-center content-center m-4">HELLO</div>
		</div>
	);
}

/**
 * TODO
 */
// export function VisualDie(props: VisualDieProps): JSX.Element {
// 	const { diceRoller } = props;

// 	const divStyle = {
// 		// color: `hsl(${parseInt(props.diceRoller.value, 10) * 60}, 70%, 50%)`,
// 		color: `hsl(${diceRoller.value * 60}, 70%, 50%)`,
// 		fontSize: "200px",
// 	};

// 	// Unicode 0x2680-0x2685 are the sides of a dice (⚀⚁⚂⚃⚄⚅)
// 	return (
// 		<div style={divStyle}>
// 			{String.fromCodePoint((0x267f + diceRoller.value) as unknown as number)}
// 		</div>
// 	);
// }

// /**
//  * TODO
//  */
// export function RollButton(props: { diceRoller: VisualDieProps }): JSX.Element {
// 	const { diceRoller } = props;

// 	return (
// 		<button
// 			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
// 			onClick={() => diceRoller.roll()}
// 		>
// 			Roll
// 		</button>
// 	);
// }
