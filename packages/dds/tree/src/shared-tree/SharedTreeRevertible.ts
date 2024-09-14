/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { makeAnonChange, type CommitKind, type GraphCommit } from "../core/index.js";
import { RevertibleStatus } from "../core/revertible.js";
import {
	UsageError,
	type ITelemetryLoggerExt,
} from "@fluidframework/telemetry-utils/internal";
import type { SharedTreeChange } from "./sharedTreeChangeTypes.js";
import type { DisposableRevertible } from "./treeCheckout.js";
import type { SharedTreeBranch } from "../shared-tree-core/index.js";
import type { SharedTreeEditBuilder } from "./sharedTreeEditBuilder.js";
import type { CommitPair } from "./revertibles.js";
import { assert } from "@fluidframework/core-utils/internal";

/**
 * TODO
 */
export class SharedTreeRevertible implements DisposableRevertible {
	/**
	 * The name of the telemetry event logged for calls to {@link SharedTreeRevertible.revertRevertible}.
	 * @privateRemarks Exposed for testing purposes.
	 */
	public static readonly revertTelemetryEventName = "RevertRevertible";

	public constructor(
		private readonly getStatus: () => RevertibleStatus,
		private readonly getCommits: () => CommitPair,

		private readonly branch: SharedTreeBranch<SharedTreeEditBuilder, SharedTreeChange>,
		private readonly logger?: ITelemetryLoggerExt,
	) {}

	public get status(): RevertibleStatus {
		return this.getStatus();
	}

	public revert(dispose?: boolean): void {
		if (this.status === RevertibleStatus.Disposed) {
			throw new UsageError("Unable to revert a revertible that has been disposed.");
		}

		const { commitToRevert, headCommit } = this.getCommits();

		// Derive some stats about the reversion to return to the caller.
		let revertAge = 0;
		let currentCommit = headCommit;
		while (commitToRevert.revision !== currentCommit.revision) {
			revertAge++;

			const parentCommit = currentCommit.parent;
			assert(parentCommit !== undefined, 0x9a9 /* expected to find a parent commit */);
			currentCommit = parentCommit;
		}

		const revertMetrics = { age: revertAge };

		this.logger?.sendTelemetryEvent({
			eventName: SharedTreeRevertible.revertTelemetryEventName,
			...revertMetrics,
		});

		if (dispose ?? false) {
			this.dispose();
		}
	}

	public dispose(): void {
		if (this.status === RevertibleStatus.Disposed) {
			throw new UsageError(
				"Unable to dispose a revertible that has already been disposed.",
			);
		}
		this.disposeRevertible(revertible, revision);
		onRevertibleDisposed?.(revertible);
	}
}
