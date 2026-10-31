/**
 * ESM resolve hook：把无扩展名的相对导入补上 .ts / .tsx / /index.ts。
 */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const CANDIDATES = ['', '.ts', '.tsx', '.mts', '/index.ts', '/index.tsx'];

export async function resolve(specifier, context, nextResolve) {
  // 只处理相对导入
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const parentURL = context.parentURL;
    if (parentURL) {
      const base = path.dirname(fileURLToPath(parentURL));
      const target = path.resolve(base, specifier);
      for (const ext of CANDIDATES) {
        const candidate = target + ext;
        if (existsSync(candidate)) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
  }
  return nextResolve(specifier, context);
}
