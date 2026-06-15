import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SettingsItemSeperator } from "@/components/settings";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";

function ThemePersonalizationSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <PageContainer>
      <PageHeader title="Theme" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1">
        <section>
          <RadioGroup value={theme} defaultValue="system" className="gap-0">
            <Item
              variant="muted"
              size="sm"
              className="group transition-none hover:cursor-pointer bg-card dark:bg-muted/50 rounded-2xl rounded-b-none"
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
              className="group transition-none hover:cursor-pointer bg-card dark:bg-muted/50 rounded-none"
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
              className="group transition-none hover:cursor-pointer bg-card dark:bg-muted/50 rounded-2xl rounded-t-none"
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
          <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
            Customize the theme of the extension.
          </p>
        </section>
      </main>
    </PageContainer>
  );
}

export default ThemePersonalizationSettingsPage;
