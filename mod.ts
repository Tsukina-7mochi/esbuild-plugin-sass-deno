import { esbuild } from "./deps.ts";
import { posix } from "./deps.ts";
import { sass } from "./deps.ts";

interface Option {
  loader: "css" | "text";
}

const sassPlugin = (option?: Option): esbuild.Plugin => ({
  name: "esbuild-plugin-sass-deno",
  setup: (build) => {
    build.onLoad({ filter: /\.scss/ }, async (args) => {
      const path = posix.resolve(args.path);
      const text = await Deno.readTextFile(path);
      const compiler = sass(text, {
        load_paths: [posix.dirname(path)]
      });
      const cssContent = compiler.to_string().toString();

      return {
        contents: cssContent,
        loader: option?.loader ?? "css",
        watchFiles: compiler.get_read_files()
      };
    });
  },
});

export default sassPlugin;
