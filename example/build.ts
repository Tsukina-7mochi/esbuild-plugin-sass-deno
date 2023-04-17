import { esbuild } from "../deps.ts";
import sassPlugin from "../mod.ts";
// import { readLines } from "https://deno.land/std@0.181.0/io/mod.ts";

const ctx = await esbuild.context({
  entryPoints: [
    "example/styles.scss",
  ],
  bundle: true,
  outdir: "example/dist",
  plugins: [
    sassPlugin(),
  ],
});

// await ctx.watch();
// for await(const _ of readLines(Deno.stdin)) {
//   //
// }
await ctx.rebuild();

esbuild.stop();
