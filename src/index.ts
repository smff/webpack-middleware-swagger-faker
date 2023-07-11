import { WebpackMiddlewareSwaggerFaker } from "../../webpack-middleware-swagger-faker_old/__types__/common";
import { jsonServerGen } from "./json-server";

export * from "./core";
export * from "./json-server";
export * from "../__types__/common";
export * from "../__types__/OpenAPI";

export const run = (config: WebpackMiddlewareSwaggerFaker) => {
    jsonServerGen(config);
}
