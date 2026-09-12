import { useEffect, useState } from "react";

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
  PANEL_SHORTCUTS,
  type PanelShortcut,
} from "@/constants/shortcuts";
import { IS_MAC } from "@/hooks/sidepanel/panel-shortcuts";
import { cn } from "@/lib/utils";
import { GlobeIcon, KeyboardIcon, PanelRightIcon } from "lucide-react";

function Kbd({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md border bg-muted font-sans text-xs font-medium whitespace-nowrap",
        muted ? "text-muted-foreground italic" : "text-foreground",
      )}
    >
      {children}
    </kbd>
  );
}

/** Every binding of a shortcut that works on this platform, as keycap labels. */
function panelKeyLabels({ bindings }: PanelShortcut): string[] {
  return bindings
    .filter((binding) => bindingApplies(binding, IS_MAC))
    .map((binding) => formatBinding(binding, IS_MAC));
}

function ShortcutRow({
  description,
  keys,
  muted,
  rounding,
}: {
  description: string;
  keys: string[];
  muted?: boolean;
  rounding: string;
}) {
  return (
    <Item
      variant="muted"
      size="sm"
      className={cn("transition-none bg-card rounded-2xl py-2.5", rounding)}
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
                Browser-wide shortcuts work on any page, whether or not
                Lexicora is open.
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
          <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
            A shortcut shows <em>Not set</em> when the browser or another
            extension already uses its keys.
          </p>
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
          {(
            [
              ["navigate", "Navigate"],
              ["act", "Actions"],
            ] as const
          ).map(([group, heading]) => {
            const shortcuts = PANEL_SHORTCUTS.filter((s) => s.group === group);
            return (
              <div key={group} className="mt-2 first:mt-0">
                <p className="text-xs text-muted-foreground ml-2.5 mb-1">
                  {heading}
                </p>
                <div className="rounded-2xl not-dark:shadow-xs">
                  {shortcuts.map((shortcut, index) => (
                    <div key={shortcut.action}>
                      {index > 0 && <SettingsItemSeparator symmetric />}
                      <ShortcutRow
                        description={shortcut.description}
                        keys={panelKeyLabels(shortcut)}
                        rounding={rowRounding(index, shortcuts.length)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2 flex flex-col gap-1.5">
            <p>
              Single keys are ignored while you type in a field or the editor.{" "}
              {IS_MAC ? "⌘S" : "Ctrl+S"} works everywhere.
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
                the browser, so they still move the web page's history while
                the panel is focused.
              </p>
            )}
          </div>
        </section>
      </main>
    </PageContainer>
  );
}

export default KeyboardShortcutsSettingsPage;
