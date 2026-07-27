import { GITHUB_URL, NPM_PACKAGES, type NpmPackage } from "./shared/links";

export function DemoLinks({ npmPackage }: { npmPackage: NpmPackage }) {
  return (
    <p className="demo-links">
      <a href={GITHUB_URL} target="_blank" rel="noreferrer">
        GitHub
      </a>
      <span className="demo-links__sep" aria-hidden="true">
        ·
      </span>
      <a href={NPM_PACKAGES[npmPackage]} target="_blank" rel="noreferrer">
        npm
      </a>
    </p>
  );
}
