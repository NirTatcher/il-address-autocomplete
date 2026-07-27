import type { DemoTab } from "./shared/demo-nav";

export function DemoNav({ active }: { active: DemoTab }) {
  return (
    <nav className="demo-nav" aria-label="Demo type">
      <a
        href="/"
        className={`demo-nav__link${active === "react" ? " demo-nav__link--active" : ""}`}
        aria-current={active === "react" ? "page" : undefined}
      >
        React
      </a>
      <a
        href="/vanilla.html"
        className={`demo-nav__link${active === "vanilla" ? " demo-nav__link--active" : ""}`}
        aria-current={active === "vanilla" ? "page" : undefined}
      >
        Vanilla JS
      </a>
    </nav>
  );
}

export type { DemoTab };
