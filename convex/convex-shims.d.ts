declare module "convex/values" {
  export const v: any;
  export class ConvexError extends Error {
    constructor(init?: any);
  }
  export type GenericId<T = string> = any;
}

declare module "convex/server" {
  export type MutationCtx = any;
  export type QueryCtx = any;
  export const action: any;
  export const mutation: any;
  export const query: any;
  export const internalAction: any;
  export type AuthConfig = any;
  export function defineSchema(...args: any[]): any;
  export function defineTable(...args: any[]): any;
  export type ActionBuilder<T = any, S = any> = any;
  export type HttpActionBuilder<T = any, S = any> = any;
  export type MutationBuilder<T = any, S = any> = any;
  export type QueryBuilder<T = any, S = any> = any;
  export type GenericActionCtx<T = any> = any;
  export type GenericMutationCtx<T = any> = any;
  export type GenericQueryCtx<T = any> = any;
  export type GenericDatabaseReader<T = any> = any;
  export type GenericDatabaseWriter<T = any> = any;
  export type ApiFromModules<T = any> = any;
  export type FilterApi<T = any, U = any> = any;
  export type FunctionReference<T = any, S = any> = any;
  export type DataModelFromSchemaDefinition<T = any> = any;
  export type DocumentByName<T = any, N = any> = any;
  export type TableNamesInDataModel<T = any> = any;
  export type SystemTableNames = any;
}

declare module "openai" {
  const OpenAI: any;
  export default OpenAI;
}

declare const process: { env: { [key: string]: string | undefined } };
