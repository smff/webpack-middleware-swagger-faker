import { jsonServerGen } from "./json-server";
import { WebpackMiddlewareSwaggerFaker } from "common";

export * from "./core";
export * from "./json-server";
export * from "../__types__/common";
export * from "../__types__/OpenAPI";

export const run = (config: WebpackMiddlewareSwaggerFaker) => {
    jsonServerGen(config);
}
