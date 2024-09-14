/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { GraphCommit } from "../core/index.js";
import type { SharedTreeChange } from "./sharedTreeChangeTypes.js";

/**
 * TODO
 */
export interface CommitPair {
	commitToRevert: GraphCommit<SharedTreeChange>;
	headCommit: GraphCommit<SharedTreeChange>;
}
