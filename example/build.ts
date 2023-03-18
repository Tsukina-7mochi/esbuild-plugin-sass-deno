import * as esbuild from "https://deno.land/x/esbuild@v0.17.11/mod.js";
import sassPlugin from "../mod.ts";

await esbuild.build({
  entryPoints: [
    "example/styles.scss"
  ],
  bundle: true,
  outdir: "example",
  plugins: [
    sassPlugin()
  ],
});

esbuild.stop();
