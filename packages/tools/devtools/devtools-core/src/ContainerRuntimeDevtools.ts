/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IFluidLoadable } from "@fluidframework/core-interfaces";

import { BaseDevtools } from "./BaseDevtools.js";
import type { ContainerKey } from "./CommonInterfaces.js";
import type { DecomposedContainer } from "./DecomposedContainer.js";
import type { ContainerDevtoolsFeatureFlags } from "./Features.js";
import type { InboundHandlers } from "./messaging/index.js";

/**
 * Properties for constructing a {@link DataObjectDevtools} instance.
 * @alpha
 */
export interface ContainerRuntimeProps {
	/**
	 * The container key to use for this data object.
	 */
	containerKey: ContainerKey;

	/**
	 * The decomposed container wrapping the data object.
	 */
	container: DecomposedContainer;

	/**
	 * (optional) Data associated with the data object.
	 */
	containerData?: Record<string, IFluidLoadable>;
}

/**
 * {@link IContainerDevtools} implementation for data objects.
 *
 * @remarks
 *
 * This class provides devtools functionality for data objects that don't support
 * container-level operations like connect/disconnect/close.
 *
 * @sealed
 */
export class ContainerRuntime extends BaseDevtools<DecomposedContainer> {
	/**
	 * The registered IContainerRuntime's decomposed container.
	 */
	protected override get container(): DecomposedContainer {
		return this._container;
	}

	private readonly _container: DecomposedContainer;

	public constructor(props: ContainerRuntimeProps) {
		// ContainerRuntime doesn't support connection operations, so pass empty handlers
		const specificHandlers: InboundHandlers = {};

		super(props.containerKey, specificHandlers, props.containerData);

		this._container = props.container;

		// Bind container and audience events after container is set
		this.bindContainerEvents();
		this.bindAudienceEvents();
	}

	protected override getSupportedFeatures(): ContainerDevtoolsFeatureFlags {
		// TODO: Add feature flag for container state management. Should be set to False.
		return {
			containerDataVisualization: this.containerData !== undefined,
		};
	}
}
