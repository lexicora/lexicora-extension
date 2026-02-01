//import "./Settings.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SettingsItemSeperator } from "@/entrypoints/sidepanel/components/ui/settings-item-seperator";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

function ThemePersonalizationSettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="lc-page-container select-none">
      <div className="lc-page-container-inner">
        <header className="flex items-center mb-4 w-full">
          <Button
            variant="ghost"
            size="icon"
            title="Go back"
            className="shrink-0 size-10 rounded-lg"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="size-4.5" />
          </Button>
          <h1 className="flex-1 mr-10 text-2xl font-semibold">Theme</h1>
        </header>
        <main className="flex flex-col gap-6 w-full pt-4.5 px-1.5">
          <section>
            {/*<Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <BellDotIcon className="size-3.5 text-red-400" />
            Notifications
          </Label>*/}
            <RadioGroup value={theme} defaultValue="system" className="gap-0">
              <Item
                variant="muted"
                size="sm"
                className="group transition-none hover:cursor-pointer bg-slate-200/75 dark:bg-muted/50 rounded-2xl rounded-b-none"
                onClick={() => setTheme("system")}
              >
                <ItemMedia variant="icon">
                  <MonitorIcon
                    className={`size-5 ${theme === "system" ? "text-amber-500 dark:text-violet-500" : "text-gray-500"}`}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>System</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <RadioGroupItem
                    value="system"
                    className="not-dark:bg-gray-300 not-dark:border-gray-400"
                  />
                </ItemActions>
              </Item>
              <SettingsItemSeperator />
              <Item
                variant="muted"
                size="sm"
                className="group transition-none hover:cursor-pointer bg-slate-200/75 dark:bg-muted/50 rounded-none"
                onClick={() => setTheme("dark")}
              >
                <ItemMedia variant="icon">
                  <MoonIcon
                    className={`size-5 ${theme === "dark" ? "text-violet-500" : "text-gray-500"}`}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Dark</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <RadioGroupItem
                    value="dark"
                    className="not-dark:bg-gray-300 not-dark:border-gray-400"
                  />
                </ItemActions>
              </Item>
              <SettingsItemSeperator />
              <Item
                variant="muted"
                size="sm"
                className="group transition-none hover:cursor-pointer bg-slate-200/75 dark:bg-muted/50 rounded-2xl rounded-t-none"
                onClick={() => setTheme("light")}
              >
                <ItemMedia variant="icon">
                  <SunIcon
                    className={`size-5 ${theme === "light" ? "text-amber-500" : "text-gray-500"}`}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Light</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <RadioGroupItem
                    value="light"
                    className="not-dark:bg-gray-300 not-dark:border-gray-400"
                  />
                </ItemActions>
              </Item>
            </RadioGroup>
            <p className="mt-2 text-muted-foreground">
              Customize the theme of the extension.
            </p>
          </section>
        </main>
        <footer>{/* Footer content if needed */}</footer>
      </div>
    </div>
  );
}

export default ThemePersonalizationSettingsPage;
