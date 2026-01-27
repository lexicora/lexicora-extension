import "./Settings.css";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "react-router-dom";
import { ChevronRightIcon, PaletteIcon, BellDotIcon } from "lucide-react";

// TODO: Maybe change the style of the settings, (might too closely resemble Apple's IOS settings app)

function SettingsPage() {
  return (
    <div className="lc-page-container select-none">
      <header className="mb-4 mt-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>
      <main className="flex flex-col gap-6 w-full px-1">
        <section id="initial-settings">
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150  bg-slate-200/75 dark:bg-muted/50 hover:bg-slate-300/75! dark:hover:bg-muted! rounded-2xl rounded-b-none"
            asChild
          >
            <Link to="/settings/personalization" viewTransition>
              <ItemMedia variant="icon">
                <PaletteIcon className="size-5 text-blue-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Personalization</ItemTitle>
                {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </Link>
          </Item>
          {/*<hr className="text-border bg-slate-300 dark:bg-muted/50 dark:text-[#2a2e3b]" />*/}
          <div className="flex flex-row">
            <div className="shrink-0 w-10.5 h-px bg-slate-200/75 dark:bg-muted/50"></div>
            <div className="flex-1 w-full h-px max-w-[calc(100%-57px)] bg-slate-300/75 dark:bg-muted"></div>
            <div className="shrink-0 w-3.75 h-px bg-slate-200/75 dark:bg-muted/50"></div>
          </div>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 dark:bg-muted/50 hover:bg-slate-300/75! dark:hover:bg-muted! rounded-2xl rounded-t-none"
            asChild
          >
            <Link to="/settings/notifications" viewTransition>
              <ItemMedia variant="icon">
                <BellDotIcon className="size-5 text-red-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Notifications</ItemTitle>
                {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </Link>
          </Item>
        </section>
        {/*<section id="personalization-section">
          <article id="personalization-theme">
            <h2 className="text-lg font-semibold mb-2">Theme</h2>
            <p className="text-sm text-muted-foreground">
              Customize the appearance of the extension to match your
              preferences.
            </p>
          </article>
        </section>
        <section id="notification-section">
          <article></article>
        </section>*/}
      </main>
    </div>
  );
}

export default SettingsPage;
