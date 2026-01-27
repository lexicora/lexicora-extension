import "./SettingsPage.css";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "react-router-dom";
import { ChevronRightIcon, PaletteIcon } from "lucide-react";

function SettingsPage() {
  return (
    <div className="lc-page-container select-none">
      <header className="mb-4">
        <h1 className="text-xl font-bold">Settings</h1>
      </header>
      <main className="flex flex-col gap-6 w-full">
        <section id="initial-settings">
          <Item variant="outline" size="default">
            <Link to="/settings/personalization">
              <ItemMedia></ItemMedia>
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
