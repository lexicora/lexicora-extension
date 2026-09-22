import { useEffect, useState } from "react";

import { Kbd } from "@/components/kbd";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SettingsItemSeparator } from "@/components/settings";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  bindingApplies,
  COMMAND_DESCRIPTIONS,
  formatBinding,
  LIBRARY_SHORTCUTS,
  PANEL_SHORTCUTS,
  suggestedKeyFor,
  type Shortcut,
} from "@/constants/shortcuts";
import { IS_MAC } from "@/hooks/sidepanel/panel-shortcuts";
import { cn } from "cn";
import { GlobeIcon, KeyboardIcon, PanelRightIcon } from "lucide-react";

/** Every binding of a shortcut that works on this platform, as keycap labels. */
function panelKeyLabels({ bindings }: Shortcut): string[] {
  return bindings
    .filter((binding) => bindingApplies(binding, IS_MAC))
    .map((binding) => formatBinding(binding, IS_MAC));
}

function ShortcutRow({
  description,
  keys,
  muted,
  rounding,
  noTopRounding = false,
}: {
  description: string;
  keys: string[];
  muted?: boolean;
  rounding: string;
  noTopRounding?: boolean;
}) {
  return (
    <Item
      variant="muted"
      size="sm"
      className={cn(
        "transition-none bg-card rounded-2xl py-2.5",
        rounding,
        noTopRounding && "rounded-t-none",
      )}
    >
      <ItemContent>
        <span className="text-sm text-pretty text-left">{description}</span>
      </ItemContent>
      <div className="flex flex-wrap justify-end gap-1 shrink-0">
        {keys.map((key) => (
          <Kbd key={key} muted={muted}>
            {key}
          </Kbd>
        ))}
      </div>
    </Item>
  );
}

/** Rounds the first and last row of a stacked group only. */
function rowRounding(index: number, count: number): string {
  if (count === 1) return "";
  if (index === 0) return "rounded-b-none";
  if (index === count - 1) return "rounded-t-none";
  return "rounded-none!";
}

async function openBrowserShortcutSettings() {
  if (import.meta.env.FIREFOX) {
    // Firefox-only API; opens "Manage Extension Shortcuts".
    const commands = browser.commands as typeof browser.commands & {
      openShortcutSettings?: () => Promise<void>;
    };
    await commands.openShortcutSettings?.();
  } else {
    await browser.tabs.create({ url: "chrome://extensions/shortcuts" });
  }
}

/**
 * The panel-wide shortcuts by group, then the Library's own — which only work
 * on the library's list pages, and say so in their heading.
 */
const SHORTCUT_SECTIONS: Array<{
  group: string;
  heading: string;
  shortcuts: readonly Shortcut[];
}> = [
  {
    group: "navigate",
    heading: "Navigate",
    shortcuts: PANEL_SHORTCUTS.filter((s) => s.group === "navigate"),
  },
  {
    group: "act",
    heading: "Actions",
    shortcuts: PANEL_SHORTCUTS.filter((s) => s.group === "act"),
  },
  { group: "library", heading: "In the Library", shortcuts: LIBRARY_SHORTCUTS },
];

function KeyboardShortcutsSettingsPage() {
  const [commands, setCommands] = useState<Browser.commands.Command[] | null>(
    null,
  );

  // Re-read on focus: bindings are changed in the browser's own settings, and
  // the list should be current when the user comes back.
  useEffect(() => {
    const load = () =>
      browser.commands
        .getAll()
        .then((all) =>
          setCommands(
            all.filter((c) => c.name && c.name in COMMAND_DESCRIPTIONS),
          ),
        )
        .catch(() => setCommands([]));
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  // What the browser did not give us a key for, and what we asked for.
  const unsetCommands = (commands ?? [])
    .filter((command) => !command.shortcut)
    .map((command) => ({
      name: command.name ?? "",
      key: suggestedKeyFor(command.name, IS_MAC),
    }))
    .filter((entry): entry is { name: string; key: string } => !!entry.key);

  return (
    <PageContainer>
      <PageHeader title="Keyboard Shortcuts" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-1">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon">
                <KeyboardIcon className="size-8 text-slate-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                Browser-wide shortcuts work on any page, whether or not Lexicora
                is open.
              </ItemDescription>
              <ItemDescription className="text-pretty line-clamp-none mt-1.5">
                Side panel shortcuts need the panel focused — click into it
                once. While it is focused the website does not receive these
                keys at all, so its own shortcuts do not fire; click back into
                the page and they work again.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>

        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <GlobeIcon className="size-3.5 text-blue-400" /> Browser-wide
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
            {commands?.map((command, index) => (
              <div key={command.name}>
                {index > 0 && <SettingsItemSeparator symmetric />}
                <ShortcutRow
                  description={
                    COMMAND_DESCRIPTIONS[command.name!] ??
                    command.description ??
                    ""
                  }
                  keys={[command.shortcut || "Not set"]}
                  muted={!command.shortcut}
                  rounding={rowRounding(index, commands.length)}
                />
              </div>
            ))}
          </div>
          <div className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2 flex flex-col gap-1.5">
            <p>
              A shortcut shows <em>Not set</em> when the browser or another
              extension already uses its keys.
            </p>
            {unsetCommands.length > 0 && (
              <p>
                Set one yourself below. Lexicora asks the browser for{" "}
                {unsetCommands.map(({ name, key }, index) => (
                  <span key={name}>
                    {index > 0 && ", "}
                    <span className="font-medium text-foreground">{key}</span>
                  </span>
                ))}
                , in the order above.
              </p>
            )}
          </div>
          <div className="flex justify-center mt-3">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground not-dark:hover:bg-muted/50"
              onClick={() => openBrowserShortcutSettings()}
            >
              Change in browser settings
            </Button>
          </div>
        </section>

        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <PanelRightIcon className="size-3.5 text-violet-400" /> In the side
            panel
          </Label>
          <div className="flex flex-col gap-3">
            {SHORTCUT_SECTIONS.map(({ group, heading, shortcuts }) => {
              return (
                <div key={group} className="mt-2 first:mt-0">
                  {/* <p className="text-xs text-muted-foreground ml-2.5 mb-1">
                  {heading}
                </p> */}
                  <Item
                    variant="muted"
                    size="sm"
                    className="bg-card p-1.5 rounded-2xl rounded-b-none"
                  >
                    <ItemContent>
                      <span className="text-sm text-muted-foreground text-pretty text-center">
                        {heading}
                      </span>
                    </ItemContent>
                  </Item>
                  <SettingsItemSeparator symmetric />
                  <div className="rounded-2xl not-dark:shadow-xs">
                    {shortcuts.map((shortcut, index) => (
                      <div key={shortcut.action}>
                        {index > 0 && <SettingsItemSeparator symmetric />}
                        <ShortcutRow
                          description={shortcut.description}
                          keys={panelKeyLabels(shortcut)}
                          rounding={rowRounding(index, shortcuts.length)}
                          noTopRounding={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2 flex flex-col gap-1.5">
            <p>
              Single keys are ignored while you type in a field or the editor.{" "}
              {IS_MAC ? "⌘S" : "Ctrl+S"} works everywhere.
            </p>
            <p>
              Home, Library and Settings are off while you create or edit, where
              the bottom bar is hidden too. Back and forward still work.
            </p>
            {!import.meta.env.FIREFOX && (
              <p>
                The mouse side buttons go back and forward here too. Hovering
                over the panel is enough — no click needed.
              </p>
            )}
            {IS_MAC && (
              <p>
                ⌘[ and ⌘] (⌘Ö and ⌘Ä on Swiss and German keyboards) are left to
                the browser, so they still move the web page's history while the
                panel is focused.
              </p>
            )}
          </div>
        </section>
      </main>
    </PageContainer>
  );
}

export default KeyboardShortcutsSettingsPage;
