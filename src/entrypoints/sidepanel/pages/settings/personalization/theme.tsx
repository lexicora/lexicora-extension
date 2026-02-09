import { useNavigate } from "react-router-dom";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SettingsItemSeperator } from "@/entrypoints/sidepanel/components/ui/settings-item-seperator";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useScrollPos } from "@/entrypoints/sidepanel/providers/scroll-observer";
import { cn } from "@/lib/utils";

function ThemePersonalizationSettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isAtTop } = useScrollPos();

  return (
    <div className="lc-page-container select-none">
      <div className="lc-page-container-inner">
        {/*<header className="flex items-center mb-4 w-full">
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
        </header>*/}
        <header className="flex flex-col w-full mb-4">
          {/*Sticky Navigation Bar (Small Title) (maybe make a bit taller)*/}
          <div
            className={cn(
              "lc-page-title-styled-bg z-29 fixed top-14.75 left-0 w-full h-11 pt-0 flex /*items-center*/ justify-center shrink-0",
              isAtTop ? "lc-page-title-styled-bg-none" : "",
            )}
          >
            <div className="flex mt-1.25 w-full">
              <Button
                variant="ghost"
                size="icon"
                title="Go back"
                className={cn(
                  "not-dark:hover:bg-gray-200/75",
                  "ml-1.75 shrink-0 size-7 transition-all duration-150 active-view-transition:transition-none",
                  {
                    "opacity-0 translate-y-3 blur-xs": isAtTop,
                    "opacity-100 translate-y-0 blur-0": !isAtTop,
                  },
                )}
                onClick={() => navigate(-1)}
              >
                <ArrowLeftIcon className="size-4" />
              </Button>
              <span
                className={cn(
                  "mr-5.75 mt-0.5 w-full text-base font-semibold transition-all duration-300 active-view-transition:transition-none /*active-view-transition:duration-200*/",
                  {
                    "opacity-0 translate-y-3 blur-xs": isAtTop,
                    "opacity-100 translate-y-0 blur-0": !isAtTop,
                  },
                )}
              >
                Settings
              </span>
            </div>
          </div>

          {/*Large Title*/}
          <div
            className={cn(
              "flex items-center mt-0 transition-opacity duration-300",
              isAtTop ? "opacity-100" : "opacity-0",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              title="Go back"
              className="shrink-0 size-10 rounded-lg"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="size-4.5" />
            </Button>
            <h1 className="text-2xl font-semibold w-full mr-10">Settings</h1>
          </div>
        </header>
        <main className="flex flex-col gap-6 w-full pt-4.5 px-1.5">
          <section>
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
