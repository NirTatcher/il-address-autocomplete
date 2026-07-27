export const GITHUB_URL =
  "https://github.com/NirTatcher/il-address-autocomplete";

export const NPM_PACKAGES = {
  core: "https://www.npmjs.com/package/@il-address/core",
  react: "https://www.npmjs.com/package/@il-address/react",
} as const;

export type NpmPackage = keyof typeof NPM_PACKAGES;

export function renderDemoLinks(npmPackage: NpmPackage): string {
  return `<p class="demo-links">
  <a href="${GITHUB_URL}" target="_blank" rel="noreferrer">GitHub</a>
  <span class="demo-links__sep" aria-hidden="true">·</span>
  <a href="${NPM_PACKAGES[npmPackage]}" target="_blank" rel="noreferrer">npm</a>
</p>`;
}
