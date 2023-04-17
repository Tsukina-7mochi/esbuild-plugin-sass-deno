import { esbuild } from "../deps.ts";
import sassPlugin from "../mod.ts";

await esbuild.build({
  entryPoints: [
    "example/injectCss.ts",
  ],
  bundle: true,
  outdir: "example/dist",
  plugins: [
    sassPlugin({
      loader: "text",
    }),
  ],
});

esbuild.stop();
