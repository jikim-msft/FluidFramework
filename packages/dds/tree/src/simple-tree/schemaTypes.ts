/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ErasedType, IFluidHandle } from "@fluidframework/core-interfaces";
import { Lazy } from "@fluidframework/core-utils/internal";
import { UsageError } from "@fluidframework/telemetry-utils/internal";

import type { FieldKey } from "../core/index.js";
import type { FlexTreeHydratedContextMinimal } from "../feature-libraries/index.js";
import {
	type MakeNominal,
	brand,
	isReadonlyArray,
	type UnionToIntersection,
	compareSets,
	type requireTrue,
	type areOnlyKeys,
	getOrCreate,
	type RestrictiveStringRecord,
	type IsUnion,
	type JsonCompatibleReadOnlyObject,
} from "../util/index.js";

import type {
	Unhydrated,
	NodeKind,
	TreeNodeSchema,
	TreeNodeSchemaClass,
	TreeNode,
	TreeNodeSchemaCore,
	TreeNodeSchemaNonClass,
	UnhydratedFlexTreeNode,
	AnnotatedAllowedType,
	NormalizedAnnotatedAllowedTypes,
} from "./core/index.js";
import { inPrototypeChain, isAnnotatedAllowedTypes } from "./core/index.js";
import { isLazy, type FlexListToUnion, type LazyItem } from "./flexList.js";
import { LeafNodeSchema } from "./leafNodeSchema.js";
import type { SimpleFieldSchema, SimpleObjectFieldSchema } from "./simpleSchema.js";
import type { InsertableContent } from "./unhydratedFlexTreeFromInsertable.js";
import { TreeNodeValid } from "./treeNodeValid.js";

/**
 * Returns true if the given schema is a {@link TreeNodeSchemaClass}, or otherwise false if it is a {@link TreeNodeSchemaNonClass}.
 * @internal
 */
export function isTreeNodeSchemaClass<
	Name extends string,
	Kind extends NodeKind,
	TNode extends TreeNode | TreeLeafValue,
	TBuild,
	ImplicitlyConstructable extends boolean,
	Info,
>(
	schema:
		| TreeNodeSchema<Name, Kind, TNode, TBuild, ImplicitlyConstructable, Info>
		| TreeNodeSchemaClass<Name, Kind, TNode & TreeNode, TBuild, ImplicitlyConstructable, Info>,
): schema is TreeNodeSchemaClass<
	Name,
	Kind,
	TNode & TreeNode,
	TBuild,
	ImplicitlyConstructable,
	Info
> {
	return schema.constructor !== undefined;
}

/**
 * Types for use in fields.
 * @remarks
 * Type constraint used in schema declaration APIs.
 *
 * The order of types in the array is not significant.
 * Additionally, it is legal for users of this type to have the runtime and compile time order of items within this array not match.
 * Therefor to ensure type safety, these arrays should not be indexed, and instead just be iterated.
 *
 * Ideally this restriction would be modeled in the type itself, but it is not ergonomic to do so as there is no easy (when compared to arrays)
 * way to declare and manipulate unordered sets of types in TypeScript.
 *
 * Duplicate entries in this array are not allowed and will produce runtime errors.
 * Duplicate types are allowed,
 * but this must only be reflected in the type and not the runtime values.
 * This duplication can be used to encode the typing when the number of items in the array is not known at compile time
 * but some of the items are known to be present unconditionally.
 * For example, typing `[typeof A] | [typeof A, typeof B]` as `[typeof A, typeof B | typeof A]` is allowed,
 * and can produce more useful {@link Input} types.
 * @privateRemarks
 * Code reading data from this should use `normalizeAllowedTypes` to ensure consistent handling, caching, nice errors etc.
 * @system @public
 */
export type AllowedTypes = readonly LazyItem<TreeNodeSchema>[];

/**
 * Stores annotations for a set of allowed types.
 * @alpha
 */
export interface AnnotatedAllowedTypes {
	/**
	 * Annotations that apply to a set of allowed types.
	 */
	readonly metadata: AllowedTypesMetadata;
	/**
	 * All the allowed types that the annotations apply to. The types themselves may also have individual annotations.
	 */
	readonly types: readonly (AnnotatedAllowedType | LazyItem<TreeNodeSchema>)[];
}

/**
 * Annotations that apply to a set of allowed types.
 * @remarks
 * Additional optionals may be added to this as non-breaking changes, so implementations of it should be simple object literals with no unlisted members.
 * @alpha
 */
export interface AllowedTypesMetadata {
	/**
	 * User defined metadata
	 */
	readonly custom?: unknown;
}

/**
 * Checks if the given allowed type is annotated with {@link AllowedTypeMetadata}.
 */
export function isAnnotatedAllowedType(
	allowedType: AnnotatedAllowedType | LazyItem<TreeNodeSchema>,
): allowedType is AnnotatedAllowedType {
	return "metadata" in allowedType && "type" in allowedType;
}

/**
 * Annotations that apply to an individual allowed type.
 * @remarks
 * Additional optionals may be added to this as non-breaking changes, so implementations of it should be simple object literals with no unlisted members.
 * @alpha
 */
export interface AllowedTypeMetadata {
	/**
	 * User defined metadata
	 */
	readonly custom?: unknown;

	// TODO metadata for enablable types will be added here
}

/**
 * Kind of a field on an {@link TreeObjectNode}.
 * @remarks
 * More kinds may be added over time, so do not assume this is an exhaustive set.
 * See {@link FieldSchema} for where these are used, and {@link SchemaFactory} for how to create schema which use them.
 * @public
 */
export enum FieldKind {
	/**
	 * A field which can be empty or filled.
	 * @remarks
	 * Allows 0 or one child.
	 */
	Optional,
	/**
	 * A field which must always be filled.
	 * @remarks
	 * Only allows exactly one child.
	 */
	Required,
	/**
	 * A special readonly field used for node identifier strings.
	 * @remarks
	 * Only allows exactly one child.
	 *
	 * See {@link SchemaFactory.identifier} for more details.
	 */
	Identifier,
}

/**
 * Maps from a property key to its corresponding {@link FieldProps.key | stored key} for the provided
 * {@link ImplicitFieldSchema | field schema}.
 *
 * @remarks
 * If an explicit stored key was specified in the schema, it will be used.
 * Otherwise, the stored key is the same as the property key.
 */
export function getStoredKey(
	propertyKey: string,
	fieldSchema: ImplicitAnnotatedFieldSchema,
): FieldKey {
	return brand(getExplicitStoredKey(fieldSchema) ?? propertyKey);
}

/**
 * Gets the {@link FieldProps.key | stored key} specified by the schema, if one was explicitly specified.
 * Otherwise, returns undefined.
 */
export function getExplicitStoredKey(
	fieldSchema: ImplicitAnnotatedFieldSchema,
): string | undefined {
	return fieldSchema instanceof FieldSchema ? fieldSchema.props?.key : undefined;
}

/**
 * Additional information to provide to a {@link FieldSchema}.
 *
 * @typeParam TCustomMetadata - Custom metadata properties to associate with the field.
 * See {@link FieldSchemaMetadata.custom}.
 *
 * @public
 */
export interface FieldProps<TCustomMetadata = unknown> {
	/**
	 * The unique identifier of a field, used in the persisted form of the tree.
	 *
	 * @remarks
	 * If not explicitly set via the schema, this is the same as the schema's property key.
	 *
	 * Specifying a stored key that differs from the property key is particularly useful in refactoring scenarios.
	 * To update the developer-facing API, while maintaining backwards compatibility with existing SharedTree data,
	 * you can change the property key and specify the previous property key as the stored key.
	 *
	 * Notes:
	 *
	 * - Stored keys have no impact on standard JavaScript behavior, on tree nodes. For example, `Object.keys`
	 * will always return the property keys specified in the schema, ignoring any stored keys that differ from
	 * the property keys.
	 *
	 * - When specifying stored keys in an object schema, you must ensure that the final set of stored keys
	 * (accounting for those implicitly derived from property keys) contains no duplicates.
	 * This is validated at runtime.
	 *
	 * @example Refactoring code without breaking compatibility with existing data
	 *
	 * Consider some existing object schema:
	 *
	 * ```TypeScript
	 * class Point extends schemaFactory.object("Point", {
	 * 	xPosition: schemaFactory.number,
	 * 	yPosition: schemaFactory.number,
	 * 	zPosition: schemaFactory.optional(schemaFactory.number),
	 * });
	 * ```
	 *
	 * Developers using nodes of this type would access the the `xPosition` property as `point.xPosition`.
	 *
	 * We would like to refactor the schema to omit "Position" from the property keys, but application data has
	 * already been persisted using the original property keys. To maintain compatibility with existing data,
	 * we can refactor the schema as follows:
	 *
	 * ```TypeScript
	 * class Point extends schemaFactory.object("Point", {
	 * 	x: schemaFactory.required(schemaFactory.number, { key: "xPosition" }),
	 * 	y: schemaFactory.required(schemaFactory.number, { key: "yPosition" }),
	 * 	z: schemaFactory.optional(schemaFactory.number, { key: "zPosition" }),
	 * });
	 * ```
	 *
	 * Now, developers can access the `x` property as `point.x`, while existing data can still be collaborated on.
	 *
	 * @defaultValue If not specified, the key that is persisted is the property key that was specified in the schema.
	 */
	readonly key?: string;

	/**
	 * A default provider used for fields which were not provided any values.
	 * @privateRemarks
	 * We are using an erased type here, as we want to expose this API but `InsertableContent` and `NodeKeyManager` are not public.
	 */
	readonly defaultProvider?: DefaultProvider;

	/**
	 * Optional metadata to associate with the field.
	 *
	 * @remarks
	 * Note: this metadata is not persisted nor made part of the collaborative state; it is strictly client-local.
	 * Different clients in the same collaborative session may see different metadata for the same field.
	 */
	readonly metadata?: FieldSchemaMetadata<TCustomMetadata>;
}

/**
 * {@link FieldProps} extended with additional `alpha` options.
 *
 * @typeParam TCustomMetadata - Custom metadata properties to associate with the field.
 * See {@link FieldSchemaMetadata.custom}.
 *
 * @alpha @input
 */
export interface FieldPropsAlpha<TCustomMetadata = unknown>
	extends FieldProps<TCustomMetadata> {
	/**
	 * The persisted metadata for this schema element.
	 */
	readonly persistedMetadata?: JsonCompatibleReadOnlyObject | undefined;
}

/**
 * A {@link FieldProvider} which requires additional context in order to produce its content
 */
export type ContextualFieldProvider = (
	context: FlexTreeHydratedContextMinimal | "UseGlobalContext",
) => UnhydratedFlexTreeNode[];
/**
 * A {@link FieldProvider} which can produce its content in a vacuum.
 */
export type ConstantFieldProvider = () => UnhydratedFlexTreeNode[];
/**
 * A function which produces content for a field every time that it is called.
 */
export type FieldProvider = ContextualFieldProvider | ConstantFieldProvider;
/**
 * Returns true if the given {@link FieldProvider} is a {@link ConstantFieldProvider}
 */
export function isConstant(
	fieldProvider: FieldProvider,
): fieldProvider is ConstantFieldProvider {
	return fieldProvider.length === 0;
}

/**
 * Provides a default value for a field.
 * @remarks
 * If present in a `FieldSchema`, when constructing new tree content that field can be omitted, and a default will be provided.
 * @system @sealed @public
 */
export interface DefaultProvider extends ErasedType<"@fluidframework/tree.FieldProvider"> {}

export function extractFieldProvider(input: DefaultProvider): FieldProvider {
	return input as unknown as FieldProvider;
}

export function getDefaultProvider(input: FieldProvider): DefaultProvider {
	return input as unknown as DefaultProvider;
}

/**
 * Metadata associated with a {@link FieldSchema}.
 *
 * @remarks Specified via {@link FieldProps.metadata}.
 *
 * @sealed
 * @public
 */
export interface FieldSchemaMetadata<TCustomMetadata = unknown> {
	/**
	 * User-defined metadata.
	 */
	readonly custom?: TCustomMetadata;

	/**
	 * The description of the field.
	 *
	 * @remarks
	 *
	 * If provided, will be used by the system in scenarios where a description of the field is useful.
	 * E.g., when converting a field schema to {@link https://json-schema.org/ | JSON Schema}, this description will be
	 * used as the `description` field.
	 */
	readonly description?: string | undefined;
}

/**
 * Metadata associated with a {@link FieldSchema}. Includes fields used by alpha features.
 *
 * @remarks Specified via {@link FieldProps.metadata}.
 *
 * @sealed
 * @alpha
 */
export interface FieldSchemaMetadataAlpha<TCustomMetadata = unknown>
	extends FieldSchemaMetadata<TCustomMetadata> {
	/**
	 * The persisted metadata for this schema element.
	 */
	readonly persistedMetadata?: JsonCompatibleReadOnlyObject | undefined;
}

/**
 * Package internal construction API.
 */
export function createFieldSchema<
	Kind extends FieldKind,
	Types extends ImplicitAllowedTypes,
	TCustomMetadata = unknown,
>(
	kind: Kind,
	annotatedTypes: Types,
	props?: FieldProps<TCustomMetadata>,
): FieldSchemaAlpha<Kind, Types, TCustomMetadata>;

/**
 * Package internal construction API that supports annotations for allowed types.
 */
export function createFieldSchema<
	Kind extends FieldKind,
	Types extends ImplicitAnnotatedAllowedTypes,
	TCustomMetadata = unknown,
>(
	kind: Kind,
	annotatedTypes: Types,
	props?: FieldProps<TCustomMetadata>,
): FieldSchemaAlpha<Kind, UnannotateImplicitAllowedTypes<Types>, TCustomMetadata>;

export function createFieldSchema<
	Kind extends FieldKind,
	Types extends ImplicitAnnotatedAllowedTypes,
	TCustomMetadata = unknown,
>(
	kind: Kind,
	annotatedTypes: Types,
	props?: FieldProps<TCustomMetadata>,
): FieldSchemaAlpha<Kind, UnannotateImplicitAllowedTypes<Types>, TCustomMetadata> {
	return createFieldSchemaPrivate(kind, annotatedTypes, props);
}

/**
 * Implementation for {@link createFieldSchema}
 */
let createFieldSchemaPrivate: <
	Kind extends FieldKind,
	Types extends ImplicitAnnotatedAllowedTypes,
	TCustomMetadata,
>(
	kind: Kind,
	annotatedTypes: Types,
	props?: FieldProps<TCustomMetadata>,
) => FieldSchemaAlpha<Kind, UnannotateImplicitAllowedTypes<Types>, TCustomMetadata>;

/**
 * All policy for a specific field,
 * including functionality that does not have to be kept consistent across versions or deterministic.
 *
 * This can include policy for how to use this schema for "view" purposes, and well as how to expose editing APIs.
 * Use {@link SchemaFactory} to create the FieldSchema instances, for example {@link SchemaStatics.optional}.
 * @privateRemarks
 * Public access to the constructor is removed to prevent creating expressible but unsupported (or not stable) configurations.
 * {@link createFieldSchema} can be used internally to create instances.
 *
 * @typeParam TCustomMetadata - Custom metadata properties to associate with the field.
 * See {@link FieldSchemaMetadata.custom}.
 *
 * @remarks
 * All implementations of this are actually {@link FieldSchemaAlpha} which exposes some additional alpha APIs.
 *
 * @sealed @public
 */
export class FieldSchema<
	out Kind extends FieldKind = FieldKind,
	out Types extends ImplicitAllowedTypes = ImplicitAllowedTypes,
	out TCustomMetadata = unknown,
> {
	/**
	 * This class is used with instanceof, and therefore should have nominal typing.
	 * This field enforces that.
	 */
	protected _typeCheck!: MakeNominal;

	private readonly lazyTypes: Lazy<ReadonlySet<TreeNodeSchema>>;

	/**
	 * What types of tree nodes are allowed in this field.
	 * @remarks Counterpart to {@link FieldSchema.allowedTypes}, with any lazy definitions evaluated.
	 */
	public get allowedTypeSet(): ReadonlySet<TreeNodeSchema> {
		return this.lazyTypes.value;
	}

	/**
	 * True if and only if, when constructing a node with this field, a value must be provided for it.
	 */
	public readonly requiresValue: boolean;

	/**
	 * {@inheritDoc FieldProps.metadata}
	 */
	public get metadata(): FieldSchemaMetadata<TCustomMetadata> {
		return this.props?.metadata ?? {};
	}

	/**
	 * This class is `@sealed`: protected members like this constructor are for internal use only.
	 * Use {@link SchemaFactory} to create the FieldSchema instances.
	 */
	protected constructor(
		/**
		 * The {@link https://en.wikipedia.org/wiki/Kind_(type_theory) | kind } of this field.
		 * Determines the multiplicity, viewing and editing APIs as well as the merge resolution policy.
		 */
		public readonly kind: Kind,
		/**
		 * What types of tree nodes are allowed in this field.
		 */
		public readonly allowedTypes: Types,
		/**
		 * Optional properties associated with the field.
		 */
		public readonly props?: FieldProps<TCustomMetadata>,
	) {
		if (!(this instanceof FieldSchemaAlpha)) {
			throw new UsageError("FieldSchema is @sealed: sub-classing is not allowed.");
		}

		this.lazyTypes = new Lazy(() => normalizeAllowedTypes(this.allowedTypes));
		// TODO: optional fields should (by default) get a default provider that returns undefined, removing the need to special case them here:
		this.requiresValue =
			this.props?.defaultProvider === undefined && this.kind !== FieldKind.Optional;
	}
}

/**
 * {@link FieldSchema} including alpha APIs (currently {@link SimpleFieldSchema}).
 * @remarks
 * This class will go away once the alpha APIs are stable and implemented by {@link FieldSchema}.
 * @sealed @alpha
 */
export class FieldSchemaAlpha<
		Kind extends FieldKind = FieldKind,
		Types extends ImplicitAllowedTypes = ImplicitAllowedTypes,
		TCustomMetadata = unknown,
	>
	extends FieldSchema<Kind, Types, TCustomMetadata>
	implements SimpleFieldSchema
{
	private readonly lazyIdentifiers: Lazy<ReadonlySet<string>>;
	private readonly lazyAnnotatedTypes: Lazy<NormalizedAnnotatedAllowedTypes>;
	private readonly propsAlpha: FieldPropsAlpha<TCustomMetadata> | undefined;

	/**
	 * Metadata on the types of tree nodes allowed on this field.
	 */
	public readonly allowedTypesMetadata: AllowedTypesMetadata;

	/**
	 * Persisted metadata for this field schema.
	 */
	public get persistedMetadata(): JsonCompatibleReadOnlyObject | undefined {
		return this.propsAlpha?.persistedMetadata;
	}

	static {
		createFieldSchemaPrivate = <
			Kind2 extends FieldKind,
			Types2 extends ImplicitAnnotatedAllowedTypes,
			TCustomMetadata2,
		>(
			kind: Kind2,
			annotatedAllowedTypes: Types2,
			props?: FieldPropsAlpha<TCustomMetadata2>,
		) =>
			new FieldSchemaAlpha(
				kind,
				unannotateImplicitAllowedTypes(annotatedAllowedTypes),
				annotatedAllowedTypes,
				props,
			);
	}

	protected constructor(
		kind: Kind,
		types: Types,
		public readonly annotatedAllowedTypes: ImplicitAnnotatedAllowedTypes,
		props?: FieldPropsAlpha<TCustomMetadata>,
	) {
		super(kind, types, props);

		this.allowedTypesMetadata = isAnnotatedAllowedTypes(annotatedAllowedTypes)
			? annotatedAllowedTypes.metadata
			: {};
		this.lazyAnnotatedTypes = new Lazy(() =>
			normalizeAnnotatedAllowedTypes(annotatedAllowedTypes),
		);
		this.lazyIdentifiers = new Lazy(
			() => new Set([...this.allowedTypeSet].map((t) => t.identifier)),
		);
		this.propsAlpha = props;
	}

	public get allowedTypesIdentifiers(): ReadonlySet<string> {
		return this.lazyIdentifiers.value;
	}

	/**
	 * What types of tree nodes are allowed in this field and their annotations.
	 * @remarks Counterpart to {@link FieldSchemaAlpha.annotatedAllowedTypes}, with any lazy definitions evaluated.
	 */
	public get annotatedAllowedTypesNormalized(): NormalizedAnnotatedAllowedTypes {
		return this.lazyAnnotatedTypes.value;
	}
}

/**
 * {@link FieldSchemaAlpha} including {@link SimpleObjectFieldSchema}.
 */
export class ObjectFieldSchema<
		Kind extends FieldKind = FieldKind,
		Types extends ImplicitAllowedTypes = ImplicitAllowedTypes,
		TCustomMetadata = unknown,
	>
	extends FieldSchemaAlpha<Kind, Types, TCustomMetadata>
	implements SimpleObjectFieldSchema
{
	public readonly storedKey: string;

	public constructor(
		kind: Kind,
		allowedTypes: Types,
		annotatedTypes: ImplicitAnnotatedAllowedTypes,
		props: FieldProps<TCustomMetadata> & { readonly key: string },
	) {
		super(kind, allowedTypes, annotatedTypes, props);
		this.storedKey = props.key;
	}
}

/**
 * Normalizes a {@link ImplicitFieldSchema} or {@link ImplicitAnnotatedFieldSchema} to a {@link FieldSchema}.
 */
export function normalizeFieldSchema(
	schema: ImplicitFieldSchema | ImplicitAnnotatedFieldSchema,
): FieldSchemaAlpha {
	return schema instanceof FieldSchema
		? (schema as FieldSchemaAlpha)
		: createFieldSchema(FieldKind.Required, schema);
}

/**
 * Normalizes a {@link ImplicitAllowedTypes} to a set of {@link TreeNodeSchema}s, by eagerly evaluating any
 * lazy schema declarations.
 *
 * @remarks Note: this must only be called after all required schemas have been declared, otherwise evaluation of
 * recursive schemas may fail.
 *
 * @internal
 */
export function normalizeAllowedTypes(
	types: ImplicitAllowedTypes,
): ReadonlySet<TreeNodeSchema> {
	const normalized = new Set<TreeNodeSchema>();
	if (isReadonlyArray(types)) {
		// Types array must not be modified after it is normalized since that would result in the user of the normalized data having wrong (out of date) content.
		Object.freeze(types);
		for (const lazyType of types) {
			normalized.add(evaluateLazySchema(lazyType));
		}
	} else {
		normalized.add(evaluateLazySchema(types));
	}
	return normalized;
}

/**
 * Normalizes an allowed type to an {@link AnnotatedAllowedType}, by adding empty annotations if they don't already exist.
 */
export function normalizeToAnnotatedAllowedType<T extends TreeNodeSchema>(
	type: T | AnnotatedAllowedType<T> | AnnotatedAllowedType<LazyItem<T>>,
): AnnotatedAllowedType<T> | AnnotatedAllowedType<LazyItem<T>> {
	return isAnnotatedAllowedType(type)
		? type
		: {
				metadata: {},
				type,
			};
}

/**
 * Normalizes a {@link ImplicitAnnotatedAllowedTypes} to a set of {@link AnnotatedAllowedSchema}s, by eagerly evaluating any
 * lazy schema declarations and adding empty metadata if it doesn't already exist.
 *
 * @remarks Note: this must only be called after all required schemas have been declared, otherwise evaluation of
 * recursive schemas may fail.
 */
export function normalizeAnnotatedAllowedTypes(
	types: ImplicitAnnotatedAllowedTypes,
): NormalizedAnnotatedAllowedTypes {
	const typesWithoutAnnotation = isAnnotatedAllowedTypes(types) ? types.types : types;
	const annotatedTypes: AnnotatedAllowedType<TreeNodeSchema>[] = [];
	if (isReadonlyArray(typesWithoutAnnotation)) {
		for (const annotatedType of typesWithoutAnnotation) {
			if (isAnnotatedAllowedType(annotatedType)) {
				annotatedTypes.push({
					type: evaluateLazySchema(annotatedType.type),
					metadata: annotatedType.metadata,
				});
			} else {
				annotatedTypes.push({ type: evaluateLazySchema(annotatedType), metadata: {} });
			}
		}
	} else {
		if (isAnnotatedAllowedType(typesWithoutAnnotation)) {
			annotatedTypes.push({
				type: evaluateLazySchema(typesWithoutAnnotation.type),
				metadata: typesWithoutAnnotation.metadata,
			});
		} else {
			annotatedTypes.push({ type: evaluateLazySchema(typesWithoutAnnotation), metadata: {} });
		}
	}

	return {
		metadata: isAnnotatedAllowedTypes(types) ? types.metadata : {},
		types: annotatedTypes,
	};
}

/**
 * Converts an {@link ImplicitAnnotatedAllowedTypes} to an {@link ImplicitAllowedTypes}s, by removing
 * any annotations.
 * @remarks
 * This does not evaluate any lazy schemas.
 */
export function unannotateImplicitAllowedTypes<Types extends ImplicitAnnotatedAllowedTypes>(
	types: Types,
): UnannotateImplicitAllowedTypes<Types> {
	return (
		isAnnotatedAllowedTypes(types)
			? types.types.map((allowedType) =>
					isAnnotatedAllowedType(allowedType) ? allowedType.type : allowedType,
				)
			: isReadonlyArray(types)
				? types.map((allowedType) =>
						isAnnotatedAllowedType(allowedType) ? allowedType.type : allowedType,
					)
				: isAnnotatedAllowedType(types)
					? (types.type as UnannotateImplicitAllowedTypes<Types>)
					: types
	) as UnannotateImplicitAllowedTypes<Types>;
}

/**
 * Removes annotations from a schema record.
 */
export function unannotateSchemaRecord<
	Schema extends RestrictiveStringRecord<ImplicitAnnotatedFieldSchema>,
>(schemaRecord: Schema): UnannotateSchemaRecord<Schema> {
	return Object.fromEntries(
		Object.entries(schemaRecord).map(([key, schema]) => [
			key,
			schema instanceof FieldSchema ? schema : unannotateImplicitAllowedTypes(schema),
		]),
	) as UnannotateSchemaRecord<Schema>;
}

/**
 * Returns true if the given {@link ImplicitFieldSchema} are equivalent, otherwise false.
 * @remarks Two ImplicitFieldSchema are considered equivalent if all of the following are true:
 * 1. They have the same {@link FieldKind | kinds}.
 * 2. They have {@link areFieldPropsEqual | equivalent FieldProps}.
 * 3. They have the same exact set of allowed types. The allowed types must be (respectively) reference equal.
 *
 * For example, comparing an ImplicitFieldSchema that is a {@link TreeNodeSchema} to an ImplicitFieldSchema that is a {@link FieldSchema}
 * will return true if they are the same kind, the FieldSchema has exactly one allowed type (the TreeNodeSchema), and they have equivalent FieldProps.
 */
export function areImplicitFieldSchemaEqual(
	a: ImplicitFieldSchema,
	b: ImplicitFieldSchema,
): boolean {
	return areFieldSchemaEqual(normalizeFieldSchema(a), normalizeFieldSchema(b));
}

/**
 * Returns true if the given {@link FieldSchema} are equivalent, otherwise false.
 * @remarks Two FieldSchema are considered equivalent if all of the following are true:
 * 1. They have the same {@link FieldKind | kinds}.
 * 2. They have {@link areFieldPropsEqual | equivalent FieldProps}.
 * 3. They have the same exact set of allowed types. The allowed types must be reference equal.
 */
export function areFieldSchemaEqual(a: FieldSchema, b: FieldSchema): boolean {
	if (a === b) {
		return true;
	}

	if (a.kind !== b.kind) {
		return false;
	}

	if (!areFieldPropsEqual(a.props, b.props)) {
		return false;
	}

	return compareSets({ a: a.allowedTypeSet, b: b.allowedTypeSet });
}

/**
 * Returns true if the given {@link FieldProps} are equivalent, otherwise false.
 * @remarks FieldProps are considered equivalent if their keys and default providers are reference equal, and their metadata are {@link areMetadataEqual | equivalent}.
 */
function areFieldPropsEqual(a: FieldProps | undefined, b: FieldProps | undefined): boolean {
	// If any new fields are added to FieldProps, this check will stop compiling as a reminder that this function needs to be updated.
	type _keys = requireTrue<areOnlyKeys<FieldProps, "key" | "defaultProvider" | "metadata">>;

	if (a === b) {
		return true;
	}

	if (a?.key !== b?.key || a?.defaultProvider !== b?.defaultProvider) {
		return false;
	}

	if (!areMetadataEqual(a?.metadata, b?.metadata)) {
		return false;
	}

	return true;
}

/**
 * Returns true if the given {@link FieldSchemaMetadata} are equivalent, otherwise false.
 * @remarks FieldSchemaMetadata are considered equivalent if their custom data and descriptions are (respectively) reference equal.
 */
function areMetadataEqual(
	a: FieldSchemaMetadataAlpha | undefined,
	b: FieldSchemaMetadataAlpha | undefined,
): boolean {
	// If any new fields are added to FieldSchemaMetadata, this check will stop compiling as a reminder that this function needs to be updated.
	type _keys = requireTrue<
		areOnlyKeys<FieldSchemaMetadataAlpha, "custom" | "description" | "persistedMetadata">
	>;

	if (a === b) {
		return true;
	}

	return (
		Object.is(a?.custom, b?.custom) &&
		a?.description === b?.description &&
		arePersistedMetadataEqual(a?.persistedMetadata, b?.persistedMetadata)
	);
}

/**
 * Returns true if the given persisted metadata fields are equivalent, otherwise false.
 * @remarks
 * Currently only handles shallow equality in the case where the keys are in the same order. This is acceptable for current use cases.
 */
function arePersistedMetadataEqual(
	a: JsonCompatibleReadOnlyObject | undefined,
	b: JsonCompatibleReadOnlyObject | undefined,
): boolean {
	if (Object.is(a, b)) {
		return true;
	}

	if (a === undefined || b === undefined) {
		return false;
	}

	// Note that the key order matters. If `a` and `b` have the same content but the keys are in a different order,
	// this method will return false.
	const aStringified = JSON.stringify(a);
	const bStringified = JSON.stringify(b);

	return aStringified === bStringified;
}

const cachedLazyItem = new WeakMap<() => unknown, unknown>();

/**
 * Returns the schema referenced by the {@link LazyItem}.
 * @remarks
 * Caches results to handle {@link LazyItem}s which compute their resulting schema.
 * @alpha
 */
export function evaluateLazySchema<T extends TreeNodeSchema>(value: LazyItem<T>): T {
	const evaluatedSchema = isLazy(value)
		? (getOrCreate(cachedLazyItem, value, value) as T)
		: value;
	if (evaluatedSchema === undefined) {
		throw new UsageError(
			`Encountered an undefined schema. This could indicate that some referenced schema has not yet been instantiated.`,
		);
	}
	markSchemaMostDerived(evaluatedSchema);
	return evaluatedSchema;
}

/**
 * Indicates that the provided schema is the "most derived" version in its class hierarchy.
 *
 * @param oneTimeInitialize - If true this runs {@link TreeNodeValid.oneTimeInitialize} which does even more initialization and validation.
 * `oneTimeInitialize` can't safely be run until all transitively referenced schema are defined, so which cases can safely use it are more limited.
 * When legal for the caller to set this to true, it is preferred, but it is often not safe due to possible forward references.
 * @remarks
 * See {@link MostDerivedData} and {@link SchemaFactory} for details on what a "most derived" schema is and why it matters.
 *
 * This is a helper for invoking {@link TreeNodeValid.markMostDerived} for {@link TreeNodeSchema}.
 *
 * Calling this helps with error messages about invalid schema usage (See {@link SchemaFactory} for the rules, some of which this helps validate).
 * Typically this should be called for each schema as early as practical to improve error reporting for invalid usages of schema
 * (using two different schema derived from the same {@link SchemaFactory} produced base class).
 *
 * Note that construction of actual {@link TreeNode} instances or use of a schema transitively in a {@link TreeViewConfiguration} already do this,
 * so any calls to this that is unconditionally after that point for the given schema is not needed.
 * Instead most usages of this should be from those cases, and from miscellaneous cases where a schema is passed into an public API where theoretically someone could accidentally
 * pass in a base class of a schema instead of the most derived one.
 */
export function markSchemaMostDerived(
	schema: TreeNodeSchema,
	oneTimeInitialize = false,
): void {
	if (schema instanceof LeafNodeSchema) {
		return;
	}

	if (!inPrototypeChain(schema, TreeNodeValid)) {
		// Use JSON.stringify to quote and escape identifier string.
		throw new UsageError(
			`Schema for ${JSON.stringify(
				schema.identifier,
			)} does not extend a SchemaFactory generated class. This is invalid.`,
		);
	}

	const schemaValid = schema as typeof TreeNodeValid & TreeNodeSchema;
	if (oneTimeInitialize) {
		schemaValid.oneTimeInitialize();
	} else {
		schemaValid.markMostDerived();
	}
}

/**
 * Types of {@link TreeNode|TreeNodes} or {@link TreeLeafValue|TreeLeafValues} allowed at a location in a tree.
 * @remarks
 * Used by {@link TreeViewConfiguration} for the root and various kinds of {@link TreeNodeSchema} to specify their allowed child types.
 *
 * Use {@link SchemaFactory} to access leaf schema or declare new composite schema.
 *
 * Implicitly treats a single type as an array of one type.
 *
 * Arrays of schema can be used to specify multiple types are allowed, which result in unions of those types in the Tree APIs.
 *
 * When saved into variables, avoid type-erasing the details, as doing so loses the compile time schema awareness of APIs derived from the types.
 *
 * When referring to types that are declared after the definition of the `ImplicitAllowedTypes`, the schema can be wrapped in a lambda to allow the forward reference.
 * See {@link ValidateRecursiveSchema} for details on how to structure the `ImplicitAllowedTypes` instances when constructing recursive schema.
 *
 * @example Explicit use with strong typing
 * ```typescript
 * const sf = new SchemaFactory("myScope");
 * const childTypes = [sf.number, sf.string] as const satisfies ImplicitAllowedTypes;
 * const config = new TreeViewConfiguration({ schema: childTypes });
 * ```
 *
 * @example Forward reference
 * ```typescript
 * const sf = new SchemaFactory("myScope");
 * class A extends sf.array("example", [() => B]) {}
 * class B extends sf.array("Inner", sf.number) {}
 * ```
 * @privateRemarks
 * Code reading data from this should use `normalizeAllowedTypes` to ensure consistent handling, caching, nice errors etc.
 * @public
 */
export type ImplicitAllowedTypes = AllowedTypes | TreeNodeSchema;

/**
 * Types of {@link TreeNode|TreeNodes} or {@link TreeLeafValue|TreeLeafValues} allowed at a location in a tree with
 * additional metadata associated with the location they're allowed at.
 * @alpha
 */
export type ImplicitAnnotatedAllowedTypes =
	| TreeNodeSchema
	| AnnotatedAllowedType
	| AnnotatedAllowedTypes
	| readonly (AnnotatedAllowedType | LazyItem<TreeNodeSchema>)[];

/**
 * Returns an {@link ImplicitAllowedTypes} that is equivalent to the input without annotations.
 * @system @alpha
 */
export type UnannotateImplicitAllowedTypes<T extends ImplicitAnnotatedAllowedTypes> =
	T extends AnnotatedAllowedTypes
		? UnannotateAllowedTypes<T>
		: T extends AnnotatedAllowedType
			? UnannotateAllowedType<T>
			: T extends readonly (AnnotatedAllowedType | LazyItem<TreeNodeSchema>)[]
				? UnannotateAllowedTypesList<T>
				: T extends TreeNodeSchema
					? T
					: never;

/**
 * Removes annotations from a list of allowed types that may contain annotations.
 * @system @alpha
 */
export type UnannotateAllowedTypesList<
	T extends readonly (AnnotatedAllowedType | LazyItem<TreeNodeSchema>)[],
> = {
	[I in keyof T]: UnannotateAllowedTypeOrLazyItem<T[I]>;
};

/**
 * Removes annotations from an allowed type that may contain annotations.
 * @system @alpha
 */
export type UnannotateAllowedTypeOrLazyItem<
	T extends AnnotatedAllowedType | LazyItem<TreeNodeSchema>,
> = T extends AnnotatedAllowedType<infer X> ? X : T;

/**
 * Removes all annotations from a set of allowed types.
 * @system @alpha
 */
export type UnannotateAllowedTypes<T extends AnnotatedAllowedTypes> =
	UnannotateAllowedTypesList<T["types"]>;

/**
 * Removes annotations from an allowed type.
 * @system @alpha
 */
export type UnannotateAllowedType<T extends AnnotatedAllowedType> =
	T extends AnnotatedAllowedType<infer X> ? [X] : T;

/**
 * Schema for a field of a tree node.
 * @remarks
 * Implicitly treats {@link ImplicitAllowedTypes} as a Required field of that type.
 * @public
 */
export type ImplicitFieldSchema = FieldSchema | ImplicitAllowedTypes;

/**
 * Annotated schema for a field of a tree node.
 * @alpha
 */
export type ImplicitAnnotatedFieldSchema = FieldSchema | ImplicitAnnotatedAllowedTypes;

/**
 * Removes annotations from an annotated field schema.
 * @system @alpha
 */
export type UnannotateImplicitFieldSchema<T extends ImplicitAnnotatedFieldSchema> =
	T extends ImplicitAnnotatedAllowedTypes ? UnannotateImplicitAllowedTypes<T> : T;

/**
 * Removes annotations from field schemas in a schema record.
 * @system @alpha
 */
export type UnannotateSchemaRecord<
	T extends RestrictiveStringRecord<ImplicitAnnotatedFieldSchema>,
> = {
	readonly [P in Extract<keyof T, string>]: UnannotateImplicitFieldSchema<T[P]>;
};

/**
 * Converts an `ImplicitFieldSchema` to a property type suitable for reading a field with this that schema.
 *
 * @typeparam TSchema - When non-exact schema are provided this errors on the side of returning too general of a type (a conservative union of all possibilities).
 * This is ideal for "output APIs" - i.e. it converts the schema type to the runtime type that a user will _read_ from the tree.
 * Examples of such "non-exact" schema include `ImplicitFieldSchema`, `ImplicitAllowedTypes`, and  TypeScript unions of schema types.
 * @public
 */
export type TreeFieldFromImplicitField<TSchema extends ImplicitFieldSchema = FieldSchema> =
	TSchema extends FieldSchema<infer Kind, infer Types>
		? ApplyKind<TreeNodeFromImplicitAllowedTypes<Types>, Kind>
		: TSchema extends ImplicitAllowedTypes
			? TreeNodeFromImplicitAllowedTypes<TSchema>
			: TreeNode | TreeLeafValue | undefined;

/**
 * Type of content that can be inserted into the tree for a field of the given schema.
 *
 * @see {@link Input}
 *
 * @typeparam TSchemaInput - Schema to process.
 * @typeparam TSchema - Do not specify: default value used as implementation detail.
 * @public
 */
export type InsertableTreeFieldFromImplicitField<
	TSchemaInput extends ImplicitFieldSchema,
	TSchema = UnionToIntersection<TSchemaInput>,
> = [TSchema] extends [FieldSchema<infer Kind, infer Types>]
	? ApplyKindInput<InsertableTreeNodeFromImplicitAllowedTypes<Types>, Kind, true>
	: [TSchema] extends [ImplicitAllowedTypes]
		? InsertableTreeNodeFromImplicitAllowedTypes<TSchema>
		: never;

/**
 * {@inheritdoc (UnsafeUnknownSchema:type)}
 * @alpha
 */
export const UnsafeUnknownSchema: unique symbol = Symbol("UnsafeUnknownSchema");

/**
 * A special type which can be provided to some APIs as the schema type parameter when schema cannot easily be provided at compile time and an unsafe (instead of disabled) editing API is desired.
 * @remarks
 * When used, this means the TypeScript typing should err on the side of completeness (allow all inputs that could be valid).
 * This introduces the risk that out-of-schema data could be allowed at compile time, and only error at runtime.
 *
 * @privateRemarks
 * This only applies to APIs which input data which is expected to be in schema, since APIs outputting have easy mechanisms to do so in a type safe way even when the schema is unknown.
 * In most cases that amounts to returning `TreeNode | TreeLeafValue`.
 *
 * This can be contrasted with the default behavior of TypeScript, which is to require the intersection of the possible types for input APIs,
 * which for unknown schema defining input trees results in the `never` type.
 *
 * Any APIs which use this must produce UsageErrors when out of schema data is encountered, and never produce unrecoverable errors,
 * or silently accept invalid data.
 * This is currently only type exported from the package: the symbol is just used as a way to get a named type.
 * @alpha
 */
export type UnsafeUnknownSchema = typeof UnsafeUnknownSchema;

/**
 * Content which could be inserted into a tree.
 *
 * @see {@link Input}
 * @remarks
 * Extended version of {@link InsertableTreeNodeFromImplicitAllowedTypes} that also allows {@link (UnsafeUnknownSchema:type)}.
 * @alpha
 */
export type Insertable<TSchema extends ImplicitAllowedTypes | UnsafeUnknownSchema> =
	TSchema extends ImplicitAllowedTypes
		? InsertableTreeNodeFromImplicitAllowedTypes<TSchema>
		: InsertableContent;

/**
 * Content which could be inserted into a field within a tree.
 *
 * @see {@link Input}
 * @remarks
 * Extended version of {@link InsertableTreeFieldFromImplicitField} that also allows {@link (UnsafeUnknownSchema:type)}.
 * @alpha
 */
export type InsertableField<TSchema extends ImplicitFieldSchema | UnsafeUnknownSchema> = [
	TSchema,
] extends [ImplicitFieldSchema]
	? InsertableTreeFieldFromImplicitField<TSchema>
	: [TSchema] extends [UnsafeUnknownSchema]
		? InsertableContent | undefined
		: never;

/**
 * Content which could be read from a field within a tree.
 *
 * @remarks
 * Extended version of {@link TreeFieldFromImplicitField} that also allows {@link (UnsafeUnknownSchema:type)}.
 * Since reading from fields with non-exact schema is still safe, this is only useful (compared to {@link TreeFieldFromImplicitField}) when the schema is also used as input and thus allows {@link (UnsafeUnknownSchema:type)}
 * for use
 * @system @alpha
 */
export type ReadableField<TSchema extends ImplicitFieldSchema | UnsafeUnknownSchema> =
	TreeFieldFromImplicitField<ReadSchema<TSchema>>;

/**
 * Adapter to remove {@link (UnsafeUnknownSchema:type)} from a schema type so it can be used with types for generating APIs for reading data.
 *
 * @remarks
 * Since reading with non-exact schema is still safe, this is mainly useful when the schema is also used as input and thus allows {@link (UnsafeUnknownSchema:type)}.
 * @system @alpha
 */
export type ReadSchema<TSchema extends ImplicitFieldSchema | UnsafeUnknownSchema> = [
	TSchema,
] extends [ImplicitFieldSchema]
	? TSchema
	: ImplicitFieldSchema;

/**
 * Suitable for output.
 * For input must error on side of excluding undefined instead.
 * @system @public
 */
export type ApplyKind<T, Kind extends FieldKind> = {
	[FieldKind.Required]: T;
	[FieldKind.Optional]: T | undefined;
	[FieldKind.Identifier]: T;
}[Kind];

/**
 * Suitable for input.
 *
 * @see {@link Input}
 * @system @public
 */
export type ApplyKindInput<T, Kind extends FieldKind, DefaultsAreOptional extends boolean> = [
	Kind,
] extends [FieldKind.Required]
	? T
	: [Kind] extends [FieldKind.Optional]
		? T | undefined
		: [Kind] extends [FieldKind.Identifier]
			? DefaultsAreOptional extends true
				? T | undefined
				: T
			: never;

/**
 * Type of tree node for a field of the given schema.
 * @public
 */
export type TreeNodeFromImplicitAllowedTypes<
	TSchema extends ImplicitAllowedTypes = TreeNodeSchema,
> = TSchema extends TreeNodeSchema
	? NodeFromSchema<TSchema>
	: TSchema extends AllowedTypes
		? NodeFromSchema<FlexListToUnion<TSchema>>
		: unknown;

/**
 * This type exists only to be linked from documentation to provide a single linkable place to document some details of
 * "Input" types and how they handle schema.
 *
 * When a schema is used to describe data which is an input into an API, the API is [contravariant](https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)) over the schema.
 * (See also, [TypeScript Variance Annotations](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations)).
 *
 * Since these schema are expressed using TypeScript types, it is possible for the user of the API to provide non-exact values of these types which has implications that depended on the variance.
 *
 * Consider a field with schema type of `A | B` (where A and B are types of schema).
 *
 * - Reading the field behaves covariantly so {@link NodeFromSchema} of `<A | B>` is the same as `NodeFromSchema<A> | NodeFromSchema<B>`, indicating that either type of node can be read from the field.
 *
 * - Writing to the field behaves contravariantly. Since it is unknown if the node actually has a schema `A` or a schema `B`, the only legal values (known to be in schema regardless of which schema the underlying node has) are values which are legal for both `A & B`.
 *
 * Note that this is distinct from the case where the schema is `[A, B]`.
 * In this case it is known that the field allows both A and B (the field can be set to an A or a B value).
 * When `A | B` is used, the field might allow
 * A but not B (so assigning a B value would be out of schema),
 * B but not A (so assigning an A value would be out of schema)
 * or both A and B.
 *
 * This gets more extreme when given completely unspecified schema.
 * For example if a field is just provided {@link ImplicitFieldSchema}, nothing is known about the content of the field.
 * This means that reading the field (via {@link TreeFieldFromImplicitField}) can give any valid tree field content,
 * but there are no safe values which could be written to the field (since it is unknown what values would be out of schema) so {@link InsertableTreeFieldFromImplicitField} gives `never`.
 *
 * To implement this variance correctly, the computation of types for input and output have to use separate utilities
 * which take very different approaches when encountering non-exact schema like unions or `ImplicitFieldSchema`.
 * The utilities which behave contravariantly (as required to handle input correctly) link this documentation to indicate that this is how they behave.
 *
 * In addition to behaving contravariantly, these input type computation utilities often have further limitations.
 * This is due to TypeScript making it difficult to implement this contravariance exactly.
 * When faced with these implementation limitations these contravariant type computation utilities error on the side of producing overly strict requirements.
 * For example in the above case of `A | B`, the utilities might compute an allowed insertable type as `never` even if there happens to be a common value accepted by both `A` and `B`.
 * Future versions of the API can relax these requirements as the type computations are made more accurate.
 *
 * For a more concrete example: if {@link InsertableTreeFieldFromImplicitField} produced `never` for a schema `A | OptionalField<A>`,
 * a future version could instead return a more flexible but still safe type, like `A`.
 *
 * More generally: try to avoid providing non-exact schema, especially for the fields of other schema.
 * While these APIs attempt to handle such cases correctly, there are limitations and known bugs in this handling.
 * Code using non-exact schema is much more likely to have its compilation break due to updates of this package or even TypeScript,
 * and thus compilation breaks due to edge cases of non-exact schema handling, especially with recursive schema, are not considered breaking changes.
 * This may change as the API become more stable.
 *
 * @privateRemarks
 * There likely is a better way to share this documentation, but none was found at the time of writing.
 *
 * TODO: Once {@link InsertableField} is public, consider using it in the examples above.
 * @system @public
 */
export type Input<T extends never> = T;

/**
 * Type of content that can be inserted into the tree for a node of the given schema.
 *
 * @see {@link Input}
 *
 * @typeparam TSchema - Schema to process.
 *
 * @privateRemarks
 * This is a bit overly conservative, since cases like `A | [A]` give never and could give `A`.
 * @public
 */
export type InsertableTreeNodeFromImplicitAllowedTypes<TSchema extends ImplicitAllowedTypes> =
	[TSchema] extends [TreeNodeSchema]
		? InsertableTypedNode<TSchema>
		: [TSchema] extends [AllowedTypes]
			? InsertableTreeNodeFromAllowedTypes<TSchema>
			: never;

/**
 * Type of content that can be inserted into the tree for a node of the given schema.
 *
 * @see {@link Input}
 *
 * @typeparam TList - AllowedTypes to process
 *
 * @privateRemarks
 * This loop is manually unrolled to allow larger unions before hitting the recursion limit in TypeScript.
 * @system @public
 */
export type InsertableTreeNodeFromAllowedTypes<TList extends AllowedTypes> =
	IsUnion<TList> extends true
		? never
		: {
				readonly [Property in keyof TList]: TList[Property] extends LazyItem<
					infer TSchema extends TreeNodeSchema
				>
					? InsertableTypedNode<TSchema>
					: never;
			}[number];

/**
 * Takes in `TreeNodeSchema[]` and returns a TypedNode union.
 * @privateRemarks
 * If a schema is both TreeNodeSchemaClass and TreeNodeSchemaNonClass, prefer TreeNodeSchemaClass since that includes subclasses properly.
 * @public
 */
export type NodeFromSchema<T extends TreeNodeSchema> = T extends TreeNodeSchemaClass<
	string,
	NodeKind,
	infer TNode
>
	? TNode
	: T extends TreeNodeSchemaNonClass<string, NodeKind, infer TNode>
		? TNode
		: never;

/**
 * Data which can be used as a node to be inserted.
 * Either an unhydrated node, or content to build a new node.
 *
 * @see {@link Input}
 *
 * @typeparam TSchemaInput - Schema to process.
 * @typeparam T - Do not specify: default value used as implementation detail.
 * @privateRemarks
 * This can't really be fully correct, since TreeNodeSchema's TNode is generally use covariantly but this code uses it contravariantly.
 * That makes this TreeNodeSchema actually invariant with respect to TNode, but doing that would break all `extends TreeNodeSchema` clauses.
 * As is, this works correctly in most realistic use-cases.
 *
 * One special case this makes is if the result of NodeFromSchema contains TreeNode, this must be an under constrained schema, so the result is set to never.
 * Note that applying UnionToIntersection on the result of NodeFromSchema<T> does not work since it breaks booleans.
 *
 * @public
 */
export type InsertableTypedNode<
	TSchema extends TreeNodeSchema,
	T = UnionToIntersection<TSchema>,
> =
	| (T extends TreeNodeSchema<string, NodeKind, TreeNode | TreeLeafValue, never, true>
			? NodeBuilderData<T>
			: never)
	| (T extends TreeNodeSchema
			? Unhydrated<TreeNode extends NodeFromSchema<T> ? never : NodeFromSchema<T>>
			: never);

/**
 * Given a node's schema, return the corresponding object from which the node could be built.
 * @privateRemarks
 * This uses TreeNodeSchemaCore, and thus depends on TreeNodeSchemaCore.createFromInsertable for the typing.
 * This works almost the same as using TreeNodeSchema,
 * except that the more complex typing in TreeNodeSchema case breaks for non-class schema and leaks in `undefined` from optional crete parameters.
 * @system @public
 */
export type NodeBuilderData<T extends TreeNodeSchemaCore<string, NodeKind, boolean>> =
	T extends TreeNodeSchemaCore<string, NodeKind, boolean, unknown, infer TBuild>
		? TBuild
		: never;

/**
 * Value that may be stored as a leaf node.
 * @remarks
 * Some limitations apply, see the documentation for {@link SchemaStatics.number} and {@link SchemaStatics.string} for those restrictions.
 * @public
 */
// eslint-disable-next-line @rushstack/no-new-null
export type TreeLeafValue = number | string | boolean | IFluidHandle | null;

/**
 * Additional information to provide to Node Schema creation.
 *
 * @typeParam TCustomMetadata - Custom metadata properties to associate with the Node Schema.
 * See {@link NodeSchemaMetadata.custom}.
 *
 * @sealed
 * @public
 */
export interface NodeSchemaOptions<out TCustomMetadata = unknown> {
	/**
	 * Optional metadata to associate with the Node Schema.
	 *
	 * @remarks
	 * Note: this metadata is not persisted nor made part of the collaborative state; it is strictly client-local.
	 * Different clients in the same collaborative session may see different metadata for the same field.
	 */
	readonly metadata?: NodeSchemaMetadata<TCustomMetadata> | undefined;
}

/**
 * Additional information to provide to Node Schema creation. Includes fields for alpha features.
 *
 * @typeParam TCustomMetadata - Custom metadata properties to associate with the Node Schema.
 * See {@link NodeSchemaMetadata.custom}.
 *
 * @alpha
 */
export interface NodeSchemaOptionsAlpha<out TCustomMetadata = unknown>
	extends NodeSchemaOptions<TCustomMetadata> {
	/**
	 * The persisted metadata for this schema element.
	 */
	readonly persistedMetadata?: JsonCompatibleReadOnlyObject | undefined;
}

/**
 * Metadata associated with a Node Schema.
 *
 * @remarks Specified via {@link NodeSchemaOptions.metadata}.
 *
 * @sealed
 * @public
 */
export interface NodeSchemaMetadata<out TCustomMetadata = unknown> {
	/**
	 * User-defined metadata.
	 */
	readonly custom?: TCustomMetadata | undefined;

	/**
	 * The description of the Node Schema.
	 *
	 * @remarks
	 *
	 * If provided, will be used by the system in scenarios where a description of the kind of node is useful.
	 * E.g., when converting a Node Schema to {@link https://json-schema.org/ | JSON Schema}, this description will be
	 * used as the `description` property.
	 */
	readonly description?: string | undefined;
}
