/** The palette on screen. */
export type ThemeName = "light" | "dark";

const STORAGE_KEY = "theme";

/**
 * Runs in <head> before first paint so the page never flashes the wrong
 * palette: the visitor's saved choice, else their system preference. A string
 * because it has to run before React loads.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})()`;

/**
 * The palette currently applied to the document.
 *
 * @returns "dark" when the init script or the toggle set it, else "light".
 */
export function currentTheme(): ThemeName {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * Switches the palette and remembers the choice in this browser. With motion
 * allowed and View Transitions supported, the new palette grows out of
 * `origin` as a circle; otherwise it swaps instantly.
 *
 * @param next - Palette to show.
 * @param origin - Viewport point the reveal starts from, usually the toggle's center.
 * @param reduced - The visitor prefers reduced motion.
 */
export function setTheme(
  next: ThemeName,
  origin: { x: number; y: number },
  reduced: boolean,
): void {
  const apply = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Blocked storage: the choice lasts until the next page load.
    }
  };
  if (reduced || typeof document.startViewTransition !== "function") {
    apply();
    return;
  }
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  const at = `at ${origin.x}px ${origin.y}px`;
  document
    .startViewTransition(apply)
    .ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px ${at})`, `circle(${radius}px ${at})`] },
        {
          duration: 420,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => undefined);
}
