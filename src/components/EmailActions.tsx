import { createSignal, onCleanup, onMount, Show } from "solid-js";

type Props = {
  email: string;
  label?: string;
};

export default function EmailActions(props: Props) {
  const [open, setOpen] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  const [closing, setClosing] = createSignal(false);

  let onDocClick: ((e: MouseEvent) => void) | undefined;
  let onKey: ((e: KeyboardEvent) => void) | undefined;
  let closeTimer: number | undefined;

  onMount(() => {
    onDocClick = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      const root = document.getElementById("email-actions-root");
      if (root && !root.contains(e.target)) close();
    };

    onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
  });

  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    const isOpening = !open();
    if (isOpening) {
      setClosing(false);
      setOpen(true);
      if (onDocClick && onKey && typeof document !== 'undefined') {
        document.addEventListener("click", onDocClick);
        document.addEventListener("keydown", onKey);
      }
    } else {
      close();
    }
  };

  onCleanup(() => {
    close();
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(props.email);
      setCopied(true);
      scheduleAutoDismiss();
    } catch {}
  };

  const close = () => {
    if (!open() || closing()) return;
    setClosing(true);
    if (onDocClick && onKey && typeof document !== 'undefined') {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    }
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  };

  const scheduleAutoDismiss = () => {
    if (closeTimer) return;
    closeTimer = window.setTimeout(() => {
      close();
    }, 1000);
  };

  return (
    <div id="email-actions-root" class="relative inline-block">
      <a
        href={`mailto:${props.email}`}
        aria-label={props.label ?? `Email ${props.email}`}
        class="underline underline-offset-2 decoration-black/15 dark:decoration-white/30 hover:decoration-black/25 hover:dark:decoration-white/50"
        onClick={toggle}
      >
        {props.email}
      </a>
      <Show when={open()} keyed>
        <Popover
          email={props.email}
          copied={copied()}
          onCopy={copy}
          onEmailClick={scheduleAutoDismiss}
          closing={closing()}
          onExited={() => {
            setOpen(false);
            setClosing(false);
            setCopied(false);
          }}
        />
      </Show>
    </div>
  );
}

function Popover(props: { email: string; copied: boolean; onCopy: () => void; onEmailClick: () => void; closing: boolean; onExited: () => void }) {
  const [appeared, setAppeared] = createSignal(false);
  onMount(() => requestAnimationFrame(() => setAppeared(true)));
  return (
    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30">
      <div
        class={
          "rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden transform-gpu origin-bottom transition duration-150 ease-out " +
          (props.closing ? "opacity-0 translate-y-1 scale-95" : appeared() ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-1 scale-95")
        }
        onTransitionEnd={(e) => {
          if (props.closing && (e.propertyName === 'opacity' || e.propertyName === 'transform')) {
            props.onExited();
          }
        }}
      >
        <div class="flex items-stretch text-sm">
          <button
            type="button"
            class="px-3 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition"
            onClick={props.onCopy}
          >
            {props.copied ? "Copied!" : "Copy"}
          </button>
          <div class="w-px self-stretch bg-black/10 dark:bg-white/15" />
          <a href={`mailto:${props.email}`} class="px-3 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition" onClick={props.onEmailClick}>
            Email
          </a>
        </div>
      </div>
    </div>
  );
}


