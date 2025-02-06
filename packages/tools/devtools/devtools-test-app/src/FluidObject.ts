/* eslint-disable jsdoc/require-jsdoc */
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { DataObject, DataObjectFactory } from "@fluidframework/aqueduct/internal";
import { SharedCell } from "@fluidframework/cell/internal";
import type { IFluidHandle, IFluidLoadable } from "@fluidframework/core-interfaces";
import { SharedCounter } from "@fluidframework/counter/internal";
import { SharedMatrix } from "@fluidframework/matrix/internal";
import { SharedString } from "@fluidframework/sequence/internal";
import { type ITree, SchemaFactory, TreeViewConfiguration } from "@fluidframework/tree";
import { SharedTree, type TreeView } from "@fluidframework/tree/internal";

export const diceSchemaFactory = new SchemaFactory("Dice_Schema");
export class DiceRoller extends diceSchemaFactory.object("DiceRoller", {
	value: diceSchemaFactory.number,
}) {
	public roll(): void {
		let newValue = -1;
		while (newValue === this.value || newValue === -1) {
			newValue = Math.floor(Math.random() * 6) + 1;
		}
		this.value = newValue;
	}
}

export class AppData extends DataObject {
	/**
	 * Key in the app's `rootMap` under which the SharedString object is stored.
	 */
	private readonly sharedTextKey = "shared-text";

	/**
	 * Key in the app's `rootMap` under which the SharedCounter object is stored.
	 */
	private readonly sharedCounterKey = "shared-counter";

	/**
	 * Key in the app's `rootMap` under which the SharedCell object is stored.
	 */
	private readonly emojiMatrixKey = "emoji-matrix";

	/**
	 * Key in the app's `rootMap` under which the SharedTree object is stored.
	 */
	private readonly sharedTreeKey = "shared-tree";

	/**
	 * TODO
	 */
	private readonly sharedTreeDiceKey = "shared-tree-dice"; // Add this new key

	/**
	 * Key in the app's `rootMap` under which the SharedDirectory object is stored.
	 */
	private readonly initialObjectsDirKey = "rootMap";

	// previous app's `rootMap`
	private readonly _initialObjects: Record<string, IFluidLoadable> = {};
	private _sharedTree: ITree | undefined;
	private _sharedTreeDice: ITree | undefined;
	private _text: SharedString | undefined;
	private _counter: SharedCounter | undefined;
	private _emojiMatrix: SharedMatrix | undefined;
	private _diceTreeView: TreeView<typeof DiceRoller> | undefined;

	private static readonly DiceRoller = DiceRoller;

	private static readonly diceConfig = new TreeViewConfiguration({
		schema: AppData.DiceRoller,
	});

	public get diceRoller(): typeof DiceRoller {
		return DiceRoller;
	}

	public get text(): SharedString {
		if (this._text === undefined) {
			throw new Error("The SharedString was not initialized correctly");
		}
		return this._text;
	}

	public get counter(): SharedCounter {
		if (this._counter === undefined) {
			throw new Error("The SharedCounter was not initialized correctly");
		}
		return this._counter;
	}

	public get emojiMatrix(): SharedMatrix {
		if (this._emojiMatrix === undefined) {
			throw new Error("The SharedMatrix was not initialized correctly");
		}
		return this._emojiMatrix;
	}

	public get sharedTree(): ITree {
		if (this._sharedTree === undefined) {
			throw new Error("The SharedTree was not initialized correctly");
		}
		return this._sharedTree;
	}

	public get sharedTreeDice(): ITree {
		if (this._sharedTreeDice === undefined) {
			throw new Error("The SharedTreeDice was not initialized correctly");
		}
		return this._sharedTreeDice;
	}

	public getRootObject(): Record<string, IFluidLoadable> {
		return this._initialObjects;
	}

	public static readonly Name = "@devtools-example/test-app";

	private static readonly factory = new DataObjectFactory(
		AppData.Name,
		AppData,
		[
			SharedString.getFactory(),
			SharedCounter.getFactory(),
			SharedMatrix.getFactory(),
			SharedCell.getFactory(),
			SharedTree.getFactory(),
		],
		{},
	);

	public static getFactory(): DataObjectFactory<AppData> {
		return this.factory;
	}

	protected async initializingFirstTime(): Promise<void> {
		// Create the shared objects and store their handles in the root SharedDirectory
		const text = SharedString.create(this.runtime, this.sharedTextKey);
		const counter = SharedCounter.create(this.runtime, this.sharedCounterKey);
		const sharedTree = SharedTree.create(this.runtime);
		const sharedTreeDice = SharedTree.create(this.runtime);

		const emojiMatrix = SharedMatrix.create(this.runtime, this.emojiMatrixKey);
		const matrixDimension = 2; // Height and Width
		emojiMatrix.insertRows(0, matrixDimension);
		emojiMatrix.insertCols(0, matrixDimension);
		for (let row = 0; row < matrixDimension; row++) {
			for (let col = 0; col < matrixDimension; col++) {
				const emojiCell = SharedCell.create(this.runtime);
				emojiMatrix.setCell(row, col, emojiCell.handle);
			}
		}
		this.populateSharedTree(sharedTree, text.handle as IFluidHandle<SharedString>);
		this.populateSharedTreeDice(sharedTreeDice);

		this.root.createSubDirectory(this.initialObjectsDirKey);
		this.root.set(this.sharedTextKey, text.handle);
		this.root.set(this.sharedCounterKey, counter.handle);
		this.root.set(this.emojiMatrixKey, emojiMatrix.handle);
		this.root.set(this.sharedTreeKey, sharedTree.handle);
		this.root.set(this.sharedTreeDiceKey, sharedTreeDice.handle);

		// Also set a couple of primitives for testing the debug view
		this.root.set("numeric-value", 42);
		this.root.set("string-value", "Hello world!");
		this.root.set("record-value", {
			aNumber: 37,
			aString: "Here is some text content.",
			anObject: {
				a: "a",
				b: "b",
			},
		});

		this._initialObjects[this.initialObjectsDirKey] = this.root.IFluidLoadable;
	}

	protected async hasInitialized(): Promise<void> {
		// Store the objects if we are loading the first time or loading from existing
		this._text = await this.root.get<IFluidHandle<SharedString>>(this.sharedTextKey)?.get();
		this._counter = await this.root
			.get<IFluidHandle<SharedCounter>>(this.sharedCounterKey)
			?.get();
		this._emojiMatrix = await this.root
			.get<IFluidHandle<SharedMatrix>>(this.emojiMatrixKey)
			?.get();
		const sharedTree = await this.root.get<IFluidHandle<ITree>>(this.sharedTreeKey)?.get();
		const sharedTreeDice = await this.root
			.get<IFluidHandle<ITree>>(this.sharedTreeDiceKey)
			?.get();
		if (sharedTree === undefined) {
			throw new Error("SharedTree was not initialized");
		} else {
			this._sharedTree = sharedTree;

			// We will always load the initial objects so they are available to the developer
			const loadInitialObjectsP: Promise<void>[] = [];
			const dir = this.root.getSubDirectory(this.initialObjectsDirKey);
			if (dir === undefined) {
				throw new Error("InitialObjects sub-directory was not initialized");
			}

			for (const [key, value] of dir.entries()) {
				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				const loadDir = async () => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
					const obj = await value.get();
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					Object.assign(this._initialObjects, { [key]: obj });
				};
				loadInitialObjectsP.push(loadDir());
			}

			await Promise.all(loadInitialObjectsP);
		}
		if (sharedTreeDice === undefined) {
			throw new Error("SharedTreeDice was not initialized");
		} else {
			this._sharedTreeDice = sharedTreeDice;
		}
	}

	private populateSharedTree(sharedTree: ITree, textHandle: IFluidHandle<SharedString>): void {
		const builder = new SchemaFactory("TodoList_Schema");

		class TodoItem extends builder.object("todo-item", {
			title: builder.string,
			completed: builder.boolean,
			dueDate: builder.optional(builder.string),
			assignee: builder.optional(builder.string),
			collaborators: builder.optional(builder.array(builder.string)),
		}) {}

		class TodoObject extends builder.object("todo-list", {
			items: builder.array(TodoItem),
		}) {}

		const TodoCategory = builder.map("todo-category", [TodoObject]);

		class TodoWorkspace extends builder.object("todo-workspace", {
			lists: TodoCategory,
			handle: builder.optional(builder.handle),
		}) {}

		const config = new TreeViewConfiguration({
			schema: [TodoWorkspace],
		});

		const view = sharedTree.viewWith(config);
		view.initialize({
			lists: {
				work: {
					items: [
						{
							title: "Finish design doc.",
							completed: false,
							dueDate: "2048-01-01",
							assignee: "Kevin",
							collaborators: ["Rick"],
						},
						{
							title: "Review pull requests",
							completed: true,
							assignee: "Bob",
						},
					],
				},
				personal: {
					items: [
						{
							title: "Buy groceries",
							completed: false,
						},
						{
							title: "Schedule dentist appointment",
							completed: false,
							dueDate: "2024-05-04",
						},
					],
				},
			},
			handle: textHandle,
		});
	}

	private populateSharedTreeDice(sharedTreeDice: ITree): void {
		// Store the view for later use
		this._diceTreeView = sharedTreeDice.viewWith(AppData.diceConfig);
		this._diceTreeView.initialize({
			value: 1,
		});
	}

	public getDiceTreeView(): TreeView<typeof DiceRoller> {
		if (this._diceTreeView === undefined) {
			throw new Error("The DiceTreeView was not initialized correctly");
		}
		return this._diceTreeView;
	}
}
