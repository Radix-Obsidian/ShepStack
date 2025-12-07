/**
 * Type system primitives for the Shep language.
 */

/**
 * Base interface for all type definitions.
 */
export interface ShepType {
  kind: string;
  nullable: boolean;
}

/**
 * Primitive types.
 */
export interface PrimitiveType extends ShepType {
  kind: "primitive";
  name: "string" | "number" | "boolean" | "void" | "any" | "unknown";
}

/**
 * Array type.
 */
export interface ArrayType extends ShepType {
  kind: "array";
  elementType: ShepType;
}

/**
 * Union type.
 */
export interface UnionType extends ShepType {
  kind: "union";
  types: ShepType[];
}

/**
 * Intersection type.
 */
export interface IntersectionType extends ShepType {
  kind: "intersection";
  types: ShepType[];
}

/**
 * Object/Record type.
 */
export interface ObjectType extends ShepType {
  kind: "object";
  properties: Map<string, ShepType>;
}

/**
 * Function type.
 */
export interface FunctionType extends ShepType {
  kind: "function";
  parameters: ShepType[];
  returnType: ShepType;
}

/**
 * Generic type.
 */
export interface GenericType extends ShepType {
  kind: "generic";
  name: string;
  typeArguments: ShepType[];
}

/**
 * Reference type (user-defined class, interface, etc.).
 */
export interface ReferenceType extends ShepType {
  kind: "reference";
  name: string;
}

/**
 * Creates a primitive type.
 */
export function createPrimitiveType(
  name: "string" | "number" | "boolean" | "void" | "any" | "unknown",
  nullable: boolean = false
): PrimitiveType {
  return { kind: "primitive", name, nullable };
}

/**
 * Creates an array type.
 */
export function createArrayType(
  elementType: ShepType,
  nullable: boolean = false
): ArrayType {
  return { kind: "array", elementType, nullable };
}

/**
 * Creates a union type.
 */
export function createUnionType(
  types: ShepType[],
  nullable: boolean = false
): UnionType {
  return { kind: "union", types, nullable };
}

/**
 * Creates an object type.
 */
export function createObjectType(
  properties: Map<string, ShepType>,
  nullable: boolean = false
): ObjectType {
  return { kind: "object", properties, nullable };
}

/**
 * Creates a function type.
 */
export function createFunctionType(
  parameters: ShepType[],
  returnType: ShepType,
  nullable: boolean = false
): FunctionType {
  return { kind: "function", parameters, returnType, nullable };
}

/**
 * Creates a reference type.
 */
export function createReferenceType(
  name: string,
  nullable: boolean = false
): ReferenceType {
  return { kind: "reference", name, nullable };
}
