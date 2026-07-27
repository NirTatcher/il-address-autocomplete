export type DemoTab = "react" | "vanilla";

export function renderDemoNav(active: DemoTab): string {
  return `<nav class="demo-nav" aria-label="Demo type">
  <a href="/" class="demo-nav__link${active === "react" ? " demo-nav__link--active" : ""}"${active === "react" ? ' aria-current="page"' : ""}>React</a>
  <a href="/vanilla.html" class="demo-nav__link${active === "vanilla" ? " demo-nav__link--active" : ""}"${active === "vanilla" ? ' aria-current="page"' : ""}>Vanilla JS</a>
</nav>`;
}
