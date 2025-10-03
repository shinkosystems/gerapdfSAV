// src/vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Adicione a tipagem das suas variáveis do Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}