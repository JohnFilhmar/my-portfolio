import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import type {
  AssistantConfig,
  AssistantMode,
  ThemeConfig,
} from "@config/schema";
import { useAssistant, type UseAssistantResult } from "@/hooks/useAssistant";
import { ASK_PATH } from "@/lib/navigation";
import { AssistantOverlay } from "@/components/assistant/AssistantOverlay";

interface AssistantPanel {
  chat: UseAssistantResult;
  /** Served mode, known once the overlay has opened or an answer arrived. */
  mode: AssistantMode | null;
  /** Real AI answers left today; null in demo mode or before the first check. */
  remaining: number | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const AssistantContext = createContext<AssistantPanel | null>(null);

const quotaSchema = z.object({
  mode: z.enum(["demo", "live"]),
  remaining: z.number().int().nonnegative().nullable(),
});

export interface AssistantProviderProps {
  assistant: AssistantConfig;
  typing: ThemeConfig["motion"]["typing"];
  reducedMotion: boolean;
  children: ReactNode;
}

/**
 * One assistant conversation for the whole page: the floating pill, the hero
 * button, the nav, the command palette and the /ask page all share it. Any
 * link to /ask opens the overlay in place instead of navigating.
 */
export function AssistantProvider({
  assistant,
  typing,
  reducedMotion,
  children,
}: AssistantProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const onServed = useCallback(
    (served: { mode: AssistantMode | null; remaining: number | null }) => {
      if (served.mode) setMode(served.mode);
      if (served.remaining !== null) setRemaining(served.remaining);
    },
    [],
  );
  const chat = useAssistant({
    assistant,
    typing,
    reduced: reducedMotion,
    onServed,
  });

  const open = useCallback(() => {
    if (!assistant.enabled) return;
    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setIsOpen(true);
    void fetch("/api/assistant", { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: unknown) => {
        const parsed = quotaSchema.safeParse(body);
        if (!parsed.success) return;
        setMode(parsed.data.mode);
        setRemaining(parsed.data.remaining);
      })
      .catch(() => undefined);
  }, [assistant.enabled]);

  const close = useCallback(() => {
    setIsOpen(false);
    openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!assistant.enabled) return;
    // Capture phase, so this runs before next/link's own click handler.
    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname !== ASK_PATH) {
        return;
      }
      event.preventDefault();
      open();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [assistant.enabled, open]);

  const value = useMemo<AssistantPanel>(
    () => ({ chat, mode, remaining, isOpen, open, close }),
    [chat, mode, remaining, isOpen, open, close],
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
      {isOpen && (
        <AssistantOverlay
          assistant={assistant}
          chat={chat}
          mode={mode}
          remaining={remaining}
          onClose={close}
        />
      )}
    </AssistantContext.Provider>
  );
}

/**
 * The page's assistant conversation and overlay controls.
 *
 * @returns The shared panel state.
 * @throws When used outside AssistantProvider.
 */
export function useAssistantPanel(): AssistantPanel {
  const panel = useContext(AssistantContext);
  if (!panel) {
    throw new Error("useAssistantPanel must be used inside AssistantProvider.");
  }
  return panel;
}
