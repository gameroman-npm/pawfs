import { defineConfig } from "@gameroman/config/oxlint/ts";

export default defineConfig({
  overrides: [
    { files: ["**/tests/**"], rules: { "no-floating-promises": "off" } },
    { files: ["**/fixtures/**"], rules: { "unicorn/no-empty-file": "off" } },
  ],
});
