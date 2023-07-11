dev:
	npx ts-node src/cli/index.ts gen
	npx ts-node src/cli/index.ts run

mock:
	npx json-server --watch mock-server/db.js --middlewares mock-server/middlewares/*.js

test:
	npx jest

release:
	rm -rf dist/
	npx tsc
	npx rollup -c rollup.config.ts

release_doc:
	rm -rf docs
	npx typedoc
	npx ts-node scripts/doc.ts
