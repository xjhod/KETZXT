/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_HASH: string;
  readonly VITE_BUILD_TIME: string;
  /** LLM 后端（Cloudflare Worker）基址；不配则用同域 /llm */
  readonly VITE_LLM_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
