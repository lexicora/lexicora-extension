import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
import { useEffect, useState } from "react";

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
import { Label } from "@/components/ui/label";
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

import { useCommandKeys } from "./use-command-keys";
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
      title: "From the right-click menu",
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
    <div className="min-h-screen w-full px-4 py-10 sm:py-16">
      <main className="mx-auto flex max-w-xl flex-col gap-5.75 text-left">
        <section>
          <Item
            variant="muted"
            size="default"
            className="bg-card rounded-2xl not-dark:shadow-xs flex-col items-center pt-7 pb-6 gap-1 text-center"
          >
            <span className="flex justify-center gap-1.5 items-baseline mb-3">
              <img
                src={lexicoraLightThemeLogoNoBg}
                className="h-[1.3rem] lc-display-light rounded-xs"
                alt=""
                aria-hidden
                draggable="false"
              />
              <img
                src={lexicoraDarkThemeLogoNoBg}
                className="h-[1.3rem] lc-display-dark rounded-xs"
                alt=""
                aria-hidden
                draggable="false"
              />
              {/*#00143d is the Lexicora color */}
              <h1 className="text-3xl font-bold text-[#00143d] dark:text-foreground leading-0">
                Lexicora
              </h1>
            </span>
            <p className="text-sm text-muted-foreground text-pretty max-w-sm">
              Keep what you read: capture it, sort it into topics, find it
              again. Here is where everything is — it takes a minute.
            </p>
            <Button
              className="mt-4"
              size="lg"
              onClick={openPanel}
              disabled={!canOpen}
            >
              <PanelRightIcon data-icon="inline-start" />
              Open the {PANEL}
            </Button>
            <p className="text-xs text-muted-foreground mt-1.5">
              {openFailed
                ? `The ${PANEL} didn't open here — use one of the ways below.`
                : "This tab closes once it is open."}
            </p>
          </Item>
        </section>

        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <PinIcon className="size-3.5 text-amber-400" /> Keep it in reach
          </Label>
          <Card rows={[pinRow]} keys={keys} />
        </section>

        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <PanelRightIcon className="size-3.5 text-blue-400" /> Open the{" "}
            {PANEL}
          </Label>
          <Card rows={openRows} keys={keys} />
          <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
            The {PANEL} is Lexicora itself: your library, the editor and
            settings, beside the page you are reading.
          </p>
        </section>

        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <BookmarkIcon className="size-3.5 text-emerald-400" /> Save what you
            read
          </Label>
          <Card rows={saveRows} keys={keys} />
          <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
            Both are on the {PANEL}'s home page, in the popup and in the
            right-click menu. Keys marked <em>Not set</em> were taken by the
            browser; choose your own under Settings → Keyboard shortcuts.
          </p>
        </section>

        <section>
          <Card
            keys={keys}
            rows={[
              {
                icon: ShieldCheckIcon,
                iconColor: "text-indigo-500",
                title: "Your library stays on this device",
                description:
                  "No account, no server, no analytics. Lexicora makes no network requests of its own; the full policy is under Settings → General → Privacy policy.",
              },
              {
                icon: LightbulbIcon,
                iconColor: "text-yellow-500",
                title: "More when you want it",
                description:
                  "Settings → Help has Tips & Tricks, the FAQ, and this page again under Getting started.",
              },
            ]}
          />
        </section>
      </main>
    </div>
  );
}

export default OnboardingPage;
