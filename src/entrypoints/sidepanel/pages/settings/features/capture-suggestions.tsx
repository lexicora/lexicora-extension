import { useState } from "react";
import {
  capturePromptStorage,
  capturePromptDelayMultiplierStorage,
} from "@/lib/utils/storage/settings";
import { useAppStorage } from "@/hooks/use-app-storage";
import { useNavigate } from "react-router-dom";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
  ItemHeader,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CameraIcon,
  CameraOffIcon,
  TimerIcon,
} from "lucide-react";

function CaptureSuggestionsSettingsPage() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useAppStorage(capturePromptStorage);
  const [delayMultiplier, setDelayMultiplier] = useAppStorage(
    capturePromptDelayMultiplierStorage,
  );

  const currentDelay = delayMultiplier || 2;

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
        <main className="flex flex-col gap-6.5 w-full pt-4.5 px-1.5 mb-2.5">
          <section>
            <Item
              variant="muted"
              size="default"
              className="group py-2.5 gap-2 transition-none bg-slate-200/75 dark:bg-muted/50 rounded-2xl rounded-b-none"
            >
              <ItemHeader>
                <ItemMedia variant="icon">
                  <CameraIcon className="size-8 text-red-500" />
                </ItemMedia>
              </ItemHeader>
              <ItemContent>
                <ItemDescription className="line-clamp-none /*leading-relaxed*/">
                  Webpage prompts that suggest capturing content after you've
                  spent some time on a site.
                  {/*TODO: Later change when this feature becomes smart with analysis*/}
                </ItemDescription>
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
                />
              </ItemActions>
            </Item>
          </section>
          <section
            className={`transition-all duration-150 ${!enabled ? "opacity-65 grayscale-30 pointer-events-none" : "opacity-100"}`}
          >
            <Item
              variant="muted"
              size="xs"
              className="bg-slate-200/75 dark:bg-muted/50 rounded-2xl py-2.5"
            >
              <div className="flex flex-col w-full gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TimerIcon className="size-5 text-orange-500" />
                    <span className="text-sm font-semibold">Prompt Delay</span>
                  </div>
                  <div className="text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-600 border border-orange-700/25 dark:border-orange-600/25 px-2 py-0.5 rounded-full">
                    {currentDelay} min
                  </div>
                </div>
                <div className="px-1.5">
                  <Slider
                    min={1}
                    max={60}
                    step={1}
                    value={[currentDelay]}
                    onValueChange={(v) => setDelayMultiplier(v[0])}
                  />
                  <div className="flex justify-between mt-2 px-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      1m
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium ">
                      30m
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      1h
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground italic text-center">
                  Suggestions will appear after {currentDelay} minute
                  {currentDelay > 1 ? "s" : ""} of activity.
                </p>
              </div>
            </Item>
            {/*<p className="mt-2 text-muted-foreground">
              Adjust the delay of the capture suggestions
            </p>*/}
          </section>
        </main>
        <footer>{/* Footer content if needed */}</footer>
      </div>
    </div>
  );
}

export default CaptureSuggestionsSettingsPage;
