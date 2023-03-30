import { esbuild } from "./deps.ts";
import { posix } from "./deps.ts";
import { sass } from "./deps.ts";
import { fs } from "./deps.ts";

interface Option {
  loader: "css" | "text";
}

const moduleLoadRegExp =
  /@(?:import|use|forward)\s*((?:"[^"]+"|'[^']+')(?:\s*,\s*(?:"[^"]+"|'[^']+'))*)\s*;/g;
const listLoadedFiles = async function (globPath: string) {
  let importedFiles: string[] = [];

  for await (const file of fs.expandGlob(globPath)) {
    if (file.isFile) {
      importedFiles.push(file.path);

      const content = await Deno.readTextFile(file.path);
      const moduleLoads = content.matchAll(moduleLoadRegExp);
      for (const match of moduleLoads) {
        const files = match[1];
        const fileRegExp = /("[^"]+"|'[^']+')\s*(?:,\s*)?/y;

        let fileMatch = fileRegExp.exec(files);
        while (fileMatch !== null) {
          const importedInFile = await listLoadedFiles(
            posix.resolve(posix.dirname(file.path), fileMatch[1].slice(1, -1)),
          );
          importedFiles = [
            ...importedFiles,
            ...importedInFile,
          ];

          fileMatch = fileRegExp.exec(files);
        }
      }
    }
  }

  return importedFiles;
};

const sassPlugin = (option?: Option): esbuild.Plugin => {
  const loadedFiles: Record<string, string[]> = {};

  return {
    name: "esbuild-plugin-sass-deno",
    setup: (build) => {
      build.onLoad({ filter: /\.scss/ }, async (args) => {
        const path = posix.resolve(args.path);
        const text = await Deno.readTextFile(path);
        const compiler = sass(text, {
          load_paths: [posix.dirname(path)],
        });
        const cssContent = compiler.to_string().toString();
        if (!(args.path in loadedFiles)) {
          loadedFiles[args.path] = await listLoadedFiles(path);
        }

        return {
          contents: cssContent,
          loader: option?.loader ?? "css",
          watchFiles: loadedFiles[args.path],
        };
      });
    },
  };
};

export default sassPlugin;
