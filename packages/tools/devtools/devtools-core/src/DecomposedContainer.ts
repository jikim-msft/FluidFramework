/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TypedEventEmitter } from "@fluid-internal/client-utils";
import type { IAudience } from "@fluidframework/container-definitions";
import type {
	AttachState,
	IContainerEvents,
	ICriticalContainerError,
} from "@fluidframework/container-definitions/internal";
import { ConnectionState } from "@fluidframework/container-loader";
import type { IEventProvider } from "@fluidframework/core-interfaces";
import type { IFluidDataStoreRuntime } from "@fluidframework/datastore-definitions/internal";

/**
 * A lightweight abstraction of a container that provides
 * only the essential properties and methods needed for Fluid DevTools functionality.
 *
 * @alpha
 */
export interface DecomposedContainer extends IEventProvider<IContainerEvents> {
	/**
	 * {@inheritDoc @fluidframework/container-definitions#IContainer.audience}
	 */
	readonly audience: IAudience;

	/**
	 * {@inheritDoc @fluidframework/container-definitions#IContainer.clientId}
	 */
	readonly clientId?: string | undefined;

	/**
	 * {@inheritDoc @fluidframework/container-definitions#IContainer.attachState}
	 */
	readonly attachState: AttachState;

	/**
	 * {@inheritDoc @fluidframework/container-definitions#IContainer.connectionState}
	 */
	readonly connectionState: ConnectionState;

	/**
	 * {@inheritDoc @fluidframework/container-definitions#IContainer.closed}
	 */
	readonly closed: boolean;

	/**
	 * {@inheritDoc @fluidframework/container-definitions#IContainer.connect}
	 */
	connect?(): void;

	/**
	 * {@inheritDoc @fluidframework/container-definitions#IContainer.disconnect}
	 */
	disconnect?(): void;

	/**
	 * {@inheritDoc @fluidframework/container-definitions#IContainer.close}
	 */
	close?(error?: ICriticalContainerError): void;
}

/**
 * Implementation of {@link DecomposedContainer} that wraps an {@link @fluidframework/container-runtime-definitions#IContainerRuntime}.
 * This class provides a bridge between the IContainerRuntime and the devtools system by exposing runtime properties and events.
 */
export class DecomposedContainerForIContainerRuntime
	extends TypedEventEmitter<IContainerEvents>
	implements DecomposedContainer
{
	private _disposed = false;

	public constructor(runtime: IFluidDataStoreRuntime) {
		super();
		this.runtime = runtime;
		runtime.on("attached", this.attachedHandler);
		runtime.on("connected", this.connectedHandler);
		runtime.on("disconnected", this.disconnectedHandler);
		// IContainer: Disposed & IContainerRuntime: Dispose
		runtime.on("dispose", this.disposeHandler);
	}

	private readonly attachedHandler = (): boolean => this.emit("attached");
	private readonly connectedHandler = (clientId: string): boolean =>
		this.emit("connected", clientId);
	private readonly disconnectedHandler = (): boolean => this.emit("disconnected");
	private readonly disposeHandler = (error?: ICriticalContainerError): boolean => {
		this._disposed = true;
		return this.emit("dispose", error);
	};

	private readonly runtime: IFluidDataStoreRuntime;

	public get audience(): IAudience {
		return this.runtime.getAudience();
	}

	public get clientId(): string | undefined {
		return this.runtime.clientId;
	}

	public get attachState(): AttachState {
		return this.runtime.attachState;
	}

	public get connectionState(): ConnectionState {
		return this.runtime.connected ? ConnectionState.Connected : ConnectionState.Disconnected;
	}

	public get closed(): boolean {
		// IContainerRuntime does not have "closed" event so replaced with "disposed" status.
		return this._disposed;
	}
}
