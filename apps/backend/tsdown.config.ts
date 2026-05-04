import { defineConfig } from "tsdown";

export default defineConfig({
	entry: "./src/app.ts",
	platform: "node",
	target: "node25",
	format: "esm",
	dts: false,
});
