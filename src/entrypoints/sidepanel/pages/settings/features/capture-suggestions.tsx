import { useState } from "react";
import {
  capturePromptStorage,
  capturePromptDelayMultiplierStorage,
} from "@/lib/utils/storage/settings";
import { useAppStorage } from "@/hooks/use-app-storage";
import { useNavigate, Link } from "react-router-dom";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SettingsItemSeperator } from "@/entrypoints/sidepanel/components/ui/settings-item-seperator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CameraIcon,
  CameraOffIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  TimerIcon,
} from "lucide-react";

function CaptureSuggestionsSettingsPage() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useAppStorage(capturePromptStorage);
  const [delayMultiplier, setDelayMultiplier] = useAppStorage(
    capturePromptDelayMultiplierStorage,
  );
  //const [enabled, setEnabled] = useStorage();

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
          <h1 className="flex-1 mr-10 text-2xl font-semibold">
            Capture Suggestions
          </h1>
        </header>
        <main className="flex flex-col gap-6 w-full pt-4.5 px-1.5">
          <section>
            <Item
              variant="muted"
              size="default"
              className="group transition-none bg-slate-200/75 dark:bg-muted/50 rounded-2xl rounded-b-none"
            >
              <ItemHeader>
                <ItemMedia variant="icon">
                  <CameraIcon className="size-7 text-red-500" />
                </ItemMedia>
              </ItemHeader>
              <ItemContent>
                {/*<ItemTitle className="text-base">
                  Account
                </ItemTitle>*/}
                <ItemDescription className="line-clamp-none">
                  Capture Suggestions are prompts that suggest to capture the
                  content of the current webpage.
                  <br />
                  They pop up in the top right corner of the current webpage,
                  after spending a certain amount of time on the site.
                  {/*Enable or disable capture suggestions to help you quickly save content.*/}
                </ItemDescription>
                {/*Later display name of user or account specific data*/}
              </ItemContent>
            </Item>
            <div className="flex flex-row">
              <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
              <div className="flex-1 w-full h-0 max-w-[calc(100%-30px)] border-t border-t-[#c4cbd4] dark:border-t-[#2b3b52]"></div>
              <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
            </div>
            <Item
              variant="muted"
              size="sm"
              className="group transition-none hover:cursor-pointer bg-slate-200/75 dark:bg-muted/50 rounded-2xl rounded-t-none"
              onClick={() => {
                setEnabled(!enabled);
              }}
            >
              <ItemMedia variant="icon">
                {/*{enableNotifications ? (
              <BellRingIcon
                className="size-5 text-green-500"
              />
            ) : (
              <BellOffIcon className="size-5 text-gray-500" />
            )}*/}
                <CameraIcon
                  className={`size-5 text-green-500 transition-all scale-100 rotate-0 ${enabled ? "" : "scale-0! -rotate-90!"}`}
                />
                <CameraOffIcon
                  className={`absolute size-5 text-gray-500 transition-all scale-100 rotate-0 ${enabled ? "scale-0! rotate-90!" : ""}`}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Capture Suggestions</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Switch
                  className="data-[state=unchecked]:bg-gray-400 dark:data-[state=unchecked]:bg-gray-700"
                  checked={enabled}
                  onClick={() => {
                    setEnabled(!enabled);
                  }}
                />
              </ItemActions>
            </Item>
          </section>
          <section>
            <Item
              variant="muted"
              size="sm"
              className="group transition-none hover:cursor-pointer bg-slate-200/75 dark:bg-muted/50 rounded-2xl /*rounded-t-none*/"
            >
              <ItemMedia variant="icon">
                <TimerIcon className="size-5 text-orange-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="mt-0.5">Delay</ItemTitle>
              </ItemContent>
              <ItemActions className="basis-full py-2">
                <Slider
                  className="w-full"
                  min={1}
                  max={10}
                  step={1}
                  value={[delayMultiplier || 2]}
                  onValueChange={(value) => {
                    setDelayMultiplier(value[0]);
                  }}
                />
              </ItemActions>
              <ItemFooter>
                <div className="w-full flex justify-between gap-5.5 px-0.25 pl-0.75">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>1</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>2</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>3</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>4</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>5</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>6</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>7</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>8</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>9</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-gray-400">|</span>
                    <span>10</span>
                  </div>
                  {/*<span className="text-sm text-muted-foreground">Short</span>
                  <span className="text-sm text-muted-foreground">Long</span>*/}
                </div>
              </ItemFooter>
            </Item>
            <p className="mt-2 text-muted-foreground">...</p>
          </section>
        </main>
        <footer>{/* Footer content if needed */}</footer>
      </div>
    </div>
  );
}

export default CaptureSuggestionsSettingsPage;
