/**
 * Node ESM 解析补丁 —— 让无扩展名的相对导入（./auth）能解析到 .ts 文件。
 *
 * 背景：项目源码统一用无扩展名导入（Vite 允许，TS 也允许），
 * 但 Node 原生 ESM 解析器要求显式扩展名。
 * 这个 hook 只在跑验证脚本时生效，不影响 Vite 构建。
 *
 * 用法：node --experimental-strip-types --import ./register-ts-resolver.mjs <script>
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register(pathToFileURL('./ts-resolve-hook.mjs'));

export {};
