/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { SharedJson1 } from "@fluid-experimental/sharejs-json1";
import { DataObject, DataObjectFactory } from "@fluidframework/aqueduct/legacy";
import { IFluidHandle } from "@fluidframework/core-interfaces";

import { AppState } from "./state.js";

/**
 * @internal
 */
export class Bubblebench extends DataObject {
	public static readonly Name = "@fluid-example/bubblebench-ot";
	private maybeTree?: SharedJson1 = undefined;
	private maybeAppState?: AppState = undefined;

	protected async initializingFirstTime(): Promise<void> {
		const tree = (this.maybeTree = SharedJson1.create(this.runtime));
		const initialTree = { clients: [] };
		// unknown used to workaround recursive Doc type that otherwise results in
		// "Type instantiation is excessively deep and possibly infinite" error.
		tree.replace<unknown, typeof initialTree>([], tree.get(), initialTree);
		this.root.set("tree", this.maybeTree.handle);
	}

	protected async initializingFromExisting(): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.maybeTree = await this.root.get<IFluidHandle<SharedJson1>>("tree")!.get();
	}

	protected async hasInitialized(): Promise<void> {
		this.maybeAppState = new AppState(
			this.tree,
			/* stageWidth: */ 640,
			/* stageHeight: */ 480,
			/* numBubbles: */ 1,
		);

		// eslint-disable-next-line unicorn/consistent-function-scoping
		const onConnected = (): void => {
			// Out of paranoia, we periodically check to see if your client Id has changed and
			// update the tree if it has.
			setInterval(() => {
				const clientId = this.runtime.clientId;
				if (clientId !== undefined && clientId !== this.appState.localClient.clientId) {
					this.appState.localClient.clientId = clientId;
				}
			}, 1000);
		};

		// Wait for connection to begin checking client Id.
		if (this.runtime.connected) {
			onConnected();
		} else {
			this.runtime.once("connected", onConnected);
		}
	}

	private get tree(): SharedJson1 {
		return this.maybeTree ?? fail("tree not initialized");
	}

	public get appState(): AppState {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.maybeAppState!;
	}
}

/**
 * The DataObjectFactory declares the Fluid object and defines any additional distributed data structures.
 * To add a SharedSequence, SharedMap, or any other structure, put it in the array below.
 * @internal
 */
export const BubblebenchInstantiationFactory = new DataObjectFactory({
	type: Bubblebench.Name,
	ctor: Bubblebench,
	sharedObjects: [SharedJson1.getFactory()],
});
