import fs from "fs";
import { isEmpty, map, camelCase } from "lodash";
import { fakerGenFromPath } from "../core";
import { generateMockFile, isJSON } from "../core/utils";
import { prettifyCode } from "./utils";
import { FakeGenOutput, WebpackMiddlewareSwaggerFaker } from "common";

export const jsonServerGen = async (swaggerFakerConfig: WebpackMiddlewareSwaggerFaker) => {
  const mockDataFolder = `${ swaggerFakerConfig.outputFolder }/data`;
  const middlewaresFolder = `${ swaggerFakerConfig.outputFolder }/middlewares`;

  if (!fs.existsSync(swaggerFakerConfig.outputFolder)) {
    fs.mkdirSync(swaggerFakerConfig.outputFolder, { recursive: true });
  }

  if (!fs.existsSync(middlewaresFolder)) {
    fs.mkdirSync(middlewaresFolder, { recursive: true });
  }

  const allSpecs: any[] = [];
  await Promise.all(swaggerFakerConfig.sourcePaths.map(async function (apiSpecsPath) {
    await fakerGenFromPath(apiSpecsPath).then(function (list) {
      list.map(function (item) {
        configJsonServer(item, middlewaresFolder, mockDataFolder);
      });
      allSpecs.push(...list);
    });
  }))
  configJsonServerMiddlewaresIndex(allSpecs, middlewaresFolder);
};

const configJsonServer = (item: FakeGenOutput, middlewaresFolder: string, mockDataFolder: string) => {
  if (!item) {
    return;
  }

  handleRequest(item, "../data", middlewaresFolder, mockDataFolder);
};

const getRoutePath = (path: string, queryParams?: string[]) => {
  const queryList = map(queryParams, (param) => `${ param }=:${ param }`);
  return !isEmpty(queryParams) ? `${ path }?${ queryList.join("&") }` : `${ path }`;
};


const handleRequest = (
    item: FakeGenOutput,
    mockDataPath: string,
    middlewarePath: string,
    mockDataFolder: string,
) => {
  const routePattern = getRoutePath(item.path);
  const operationId = camelCase(item.operationId);

  if (!operationId) {
    return;
  }


  const resWithMockData = `
    var _${ operationId } = require("${ mockDataPath }/${ operationId }.json");
    
    module.exports = {
        name: '${ operationId }',
        path: '${ routePattern }',
        middleware: (req, res) => {
          res.json(_${ operationId });
      }
    }
    `;

  const resWithoutMockData = `
     module.exports = {
        name: '${ operationId }',
        path: '${ routePattern }',
        middleware: (req, res) => {
          res.status(200).send();
        }
      }
    `;

  const code = item.mocks && isJSON(item.mocks) ? resWithMockData : resWithoutMockData;

  generateMockFile(item.mocks, operationId, mockDataFolder);
  fs.writeFileSync(`${ middlewarePath }/${ operationId }.js`, prettifyCode(code));
};


const configJsonServerMiddlewaresIndex = (moduleItems: any, middlewaresFolder: string) => {
  const indexFile = `${ middlewaresFolder }/index.js`;
  fs.writeFileSync(indexFile, '')
  moduleItems.forEach((item: any) => {
    if (item && item.operationId) {
      const importLine = `const _${item.operationId} = require('./${ item.operationId }');\n`
      fs.appendFileSync(indexFile, importLine)
    }
  })

  fs.appendFileSync(indexFile, 'module.exports = {\n')
  moduleItems.forEach((item: any) => {
    if (item && item.operationId) {
      const importLine = `${ item.operationId } : _${ item.operationId },\n`
      fs.appendFileSync(indexFile, importLine)
    }
  })
  fs.appendFileSync(indexFile, '}')
}
