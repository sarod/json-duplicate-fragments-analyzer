export type JsonValue = number | string | boolean | JsonArray | JsonObject;
export interface JsonObject { [key: string]: JsonValue };
export interface JsonArray extends Array<JsonValue> {
}