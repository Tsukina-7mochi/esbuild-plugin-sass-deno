import { esbuild, path, sass } from "./deps.ts";

interface Option {
  loader: "css" | "text";
}

const sassPlugin = (option?: Option): esbuild.Plugin => {
  // TODO: cache sass compilation result

  return {
    name: "esbuild-plugin-sass-deno",
    setup: (build) => {
      build.onLoad({ filter: /\.s[ac]ss/ }, async (args) => {
        const resolvedPath = path.resolve(args.path);
        const result = await sass.compileAsync(resolvedPath);
        const watchFiles = result.loadedUrls
          .filter((url) => url.href.startsWith("file:"))
          .map((url) => path.fromFileUrl(url));

        return {
          contents: result.css,
          loader: option?.loader ?? "css",
          watchFiles,
        };
      });
    },
  };
};

export default sassPlugin;
