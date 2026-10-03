import { ReactLenis } from "lenis/react";

/**
 * Smoothed page scrolling (Lenis). In-page links land where the sections'
 * scroll-margin says, as with native scrolling. Dialogs and anything marked
 * `data-lenis-prevent` keep native scrolling, so the page behind a modal
 * never moves. Mount it only when motion is allowed.
 */
export function SmoothScroll() {
  return (
    <ReactLenis
      root
      options={{
        allowNestedScroll: true,
        anchors: true,
        prevent: (node) =>
          node.closest('[role="dialog"], [data-lenis-prevent]') !== null,
      }}
    />
  );
}
