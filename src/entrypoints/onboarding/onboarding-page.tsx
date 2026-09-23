import { useEffect, useRef, useState } from "react";

import { Kbd } from "@/components/kbd";
import { SettingsItemSeparator } from "@/components/settings";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { COMMAND_ID, suggestedKeyFor } from "@/constants/shortcuts";
import { IS_MAC } from "@/hooks/sidepanel/panel-shortcuts";
import { cn } from "cn";
import {
  BookmarkIcon,
  CameraIcon,
  CheckIcon,
  KeyboardIcon,
  LightbulbIcon,
  MousePointerClickIcon,
  PanelRightIcon,
  PinIcon,
  ShieldCheckIcon,
  SquareMousePointerIcon,
  TextSelectIcon,
} from "lucide-react";

import { LogoLockup, useLogoIntro } from "./logo-intro";
import { ToolbarPointer } from "./toolbar-pointer";
import { useCommandKeys } from "./use-command-keys";
import { useDisableZoom } from "./use-disable-zoom";
import { useToolbarPin } from "./use-toolbar-pin";

/** Firefox calls it a sidebar, in its own menus and in ours. */
const PANEL = import.meta.env.FIREFOX ? "sidebar" : "side panel";

const OPEN_COMMAND = import.meta.env.FIREFOX
  ? COMMAND_ID.FIREFOX_OPEN_SIDEBAR
  : COMMAND_ID.OPEN_SIDE_PANEL;

/** Where each browser keeps the pin, in its own words. */
const PIN_STEPS = import.meta.env.FIREFOX
  ? "Open the Extensions button (the puzzle piece) in the toolbar, then Lexicora's gear menu, and choose Pin to Toolbar."
  : import.meta.env.EDGE
    ? "Open the Extensions button (the puzzle piece) in the toolbar and select the eye icon next to Lexicora."
    : "Open the Extensions button (the puzzle piece) in the toolbar and select the pin next to Lexicora.";

/** Rounds the first and last row of a stacked card only. */
function rowRounding(index: number, count: number): string {
  if (count === 1) return "rounded-2xl";
  if (index === 0) return "rounded-2xl rounded-b-none";
  if (index === count - 1) return "rounded-2xl rounded-t-none";
  return "rounded-none";
}

interface Row {
  icon: typeof PinIcon;
  iconColor: string;
  title: string;
  description: React.ReactNode;
  /** A command name; its bound key is shown on the right. */
  command?: string;
}

function Card({
  rows,
  keys,
}: {
  rows: Row[];
  keys: Record<string, string> | null;
}) {
  return (
    <div className="rounded-2xl not-dark:shadow-xs">
      {rows.map((row, index) => (
        <div key={row.title}>
          {index > 0 && <SettingsItemSeparator />}
          <Item
            variant="muted"
            size="sm"
            className={cn(
              "bg-card transition-none",
              rowRounding(index, rows.length),
            )}
          >
            <ItemMedia variant="icon">
              <row.icon className={cn("size-5", row.iconColor)} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{row.title}</ItemTitle>
              <ItemDescription className="line-clamp-none text-pretty">
                {row.description}
              </ItemDescription>
            </ItemContent>
            {row.command && keys && (
              <CommandKey command={row.command} keys={keys} />
            )}
          </Item>
        </div>
      ))}
    </div>
  );
}

/** A section's title and what it is about, above or beside its content. */
function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="mb-4 md:mb-5">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground text-pretty max-w-prose">
        {description}
      </p>
    </div>
  );
}

/** One way of doing something, as a card of its own in a grid. */
function Tile({
  row,
  keys,
}: {
  row: Row;
  keys: Record<string, string> | null;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 not-dark:shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-9 items-center justify-center rounded-md bg-muted">
          <row.icon className={cn("size-5", row.iconColor)} />
        </span>
        {row.command && keys && (
          <CommandKey command={row.command} keys={keys} />
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium">{row.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {row.description}
        </p>
      </div>
    </div>
  );
}

/** The key the browser bound, or "Not set" with the one to set it to. */
function CommandKey({
  command,
  keys,
}: {
  command: string;
  keys: Record<string, string>;
}) {
  const bound = keys[command];
  if (bound) return <Kbd>{bound}</Kbd>;

  const suggested = suggestedKeyFor(command, IS_MAC);
  return (
    <span
      className="flex shrink-0"
      title={
        suggested
          ? `The browser left this unset. Set it in Settings → Keyboard shortcuts; Lexicora asks for ${suggested}.`
          : "The browser left this unset."
      }
    >
      <Kbd muted>Not set</Kbd>
    </span>
  );
}

/**
 * Shown once, on install: where Lexicora lives and how to open it, then the
 * side panel itself. Not a flow — everything is on one screen, and the button
 * at the top leaves it.
 */
function OnboardingPage() {
  const keys = useCommandKeys();
  const isPinned = useToolbarPin();
  useDisableZoom();

  const lockupRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const pinCardRef = useRef<HTMLDivElement>(null);
  const intro = useLogoIntro(lockupRef, contentRef);

  // Resolved up front, so the click can open the panel before any `await`:
  // both browsers only open it straight from a user gesture.
  const [tab, setTab] = useState<{ id?: number; windowId?: number } | null>(
    null,
  );
  const [openFailed, setOpenFailed] = useState(false);

  useEffect(() => {
    browser.tabs
      .getCurrent()
      .then((current) =>
        setTab({ id: current?.id, windowId: current?.windowId }),
      )
      .catch(() => setTab({}));
  }, []);

  const openPanel = () => {
    const opening: Promise<unknown> = import.meta.env.FIREFOX
      ? // @ts-ignore: sidebarAction is a Firefox-specific API
        browser.sidebarAction.open()
      : browser.sidePanel.open({ windowId: tab!.windowId! });

    // The panel belongs to the window, not this tab, so it stays open once
    // the tab is gone and shows beside whichever page comes to the front.
    opening
      .then(() => (tab?.id !== undefined ? browser.tabs.remove(tab.id) : null))
      .catch(() => setOpenFailed(true));
  };

  const canOpen = import.meta.env.FIREFOX || tab?.windowId !== undefined;

  const pinRow: Row =
    isPinned === true
      ? {
          icon: CheckIcon,
          iconColor: "text-emerald-500",
          title: "Pinned to your toolbar",
          description:
            "Lexicora's button is on the toolbar, one click from any page.",
        }
      : {
          icon: PinIcon,
          iconColor: "text-amber-500",
          title: "Pin Lexicora to your toolbar",
          description: `${PIN_STEPS} The button then stays in view instead of inside the menu.`,
        };

  const openRows: Row[] = [
    {
      icon: SquareMousePointerIcon,
      iconColor: "text-blue-500",
      title: "From the toolbar",
      description: (
        <>
          Click Lexicora's button to open the popup, then{" "}
          <PanelRightIcon className="inline size-3.5 -mt-0.5" aria-hidden /> at
          its top right.
        </>
      ),
    },
    {
      icon: KeyboardIcon,
      iconColor: "text-slate-500",
      title: "With a shortcut",
      description: `Opens and closes the ${PANEL} from any page.`,
      command: OPEN_COMMAND,
    },
    {
      icon: MousePointerClickIcon,
      iconColor: "text-violet-500",
      title: "From the context menu",
      description:
        "Right-click a page and choose Lexicora → Toggle side panel.",
    },
  ];

  const saveRows: Row[] = [
    {
      icon: CameraIcon,
      iconColor: "text-red-500",
      title: "Capture page",
      description:
        "Keeps the page's content in an editor you can annotate and search, so it outlasts the page changing.",
      command: COMMAND_ID.CAPTURE,
    },
    {
      icon: TextSelectIcon,
      iconColor: "text-orange-500",
      title: "Capture a selection",
      description:
        "Select text first and the same shortcut keeps only that. Or right-click it and choose Capture Selection.",
    },
    {
      icon: BookmarkIcon,
      iconColor: "text-emerald-500",
      title: "Bookmark",
      description:
        "Keeps only what the page says about itself: title, link, site and description.",
      command: COMMAND_ID.BOOKMARK,
    },
  ];

  return (
    // Nothing here is content to copy, so none of it selects: the page reads
    // as the app's own surface rather than a document.
    //
    // The right padding gives back the width a classic scrollbar takes
    // (--lc-scrollbar-offset is 10px less that width), so the column is
    // centred on the window, not on what the scrollbar leaves of it. Without
    // one, both sides are equal. max() keeps a wide scrollbar from asking for
    // negative padding.
    <div className="min-h-screen w-full py-6 sm:py-8 md:pt-12 select-none pl-4 pr-[max(0px,calc(var(--lc-scrollbar-offset)+6px))] sm:pl-8 sm:pr-[max(0px,calc(var(--lc-scrollbar-offset)+22px))]">
      {intro.copy}
      <main
        ref={contentRef}
        className="mx-auto flex max-w-5xl flex-col gap-12 text-left"
        style={{ opacity: intro.isDone ? undefined : 0 }}
        // Invisible is not absent: a click meant to skip the intro must not
        // land on the button underneath.
        inert={!intro.isDone}
      >
        {/* Welcome and the one action, beside the step worth doing first. */}
        <section className="grid items-center gap-8 md:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col items-start">
            <div
              className="mb-5"
              data-lc-occlude
              style={{ visibility: intro.isDone ? undefined : "hidden" }}
            >
              <LogoLockup ref={lockupRef} />
            </div>
            {/* data-lc-occlude: the toolbar pointer breaks around each line
                of this, as if it passed beneath; see toolbar-pointer.tsx. */}
            <h1 className="text-4xl font-bold tracking-tight text-balance">
              <span data-lc-occlude>Keep what you read.</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground text-pretty max-w-md">
              <span data-lc-occlude>
                Capture a page or bookmark it, sort it into topics, and find it
                again later. Here is where everything is — it takes a minute.
              </span>
            </p>
            <Button
              className="mt-6"
              size="lg"
              onClick={openPanel}
              disabled={!canOpen}
              data-lc-occlude
            >
              <PanelRightIcon data-icon="inline-start" />
              Open the {PANEL}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              <span data-lc-occlude>
                {openFailed
                  ? `The ${PANEL} didn't open here — use one of the ways below.`
                  : "This tab closes once it is open."}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div ref={pinCardRef}>
              <Card rows={[pinRow]} keys={keys} />
            </div>
            <Card
              keys={keys}
              rows={[
                {
                  icon: ShieldCheckIcon,
                  iconColor: "text-indigo-500",
                  title: "Your library stays on this device",
                  description:
                    "No account, no server, no analytics. Lexicora makes no network requests of its own.",
                },
              ]}
            />
          </div>
        </section>

        <section>
          <SectionHeading
            title={`Open the ${PANEL}`}
            description={`The ${PANEL} is Lexicora itself: your library, the editor and settings, beside the page you are reading.`}
          />
          <div className="grid gap-3 md:grid-cols-3">
            {openRows.map((row) => (
              <Tile key={row.title} row={row} keys={keys} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1fr_1.6fr] md:gap-8">
          <SectionHeading
            title="Save what you read"
            description={
              <>
                Both are on the {PANEL}'s home page, in the popup and in the
                right-click menu, as well as on the keys shown. A key marked{" "}
                <em>Not set</em> was taken by the browser; choose your own under
                Settings → Keyboard shortcuts.
              </>
            }
          />
          <Card rows={saveRows} keys={keys} />
        </section>

        <footer className="flex items-center justify-center gap-2 text-sm text-muted-foreground text-center text-pretty">
          <LightbulbIcon className="size-4 shrink-0 text-yellow-500" />
          <span>
            More in Settings → Help: Tips &amp; Tricks, the FAQ, and this page
            again under Getting started.
          </span>
        </footer>
      </main>
      {/* Once the page is revealed, and only until Lexicora is pinned. After
          <main>: refs attach in tree order, and the pointer measures the pin
          card in a layout effect. */}
      <ToolbarPointer
        anchorRef={pinCardRef}
        visible={intro.isDone && isPinned !== true}
      />
    </div>
  );
}

export default OnboardingPage;
