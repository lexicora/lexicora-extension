import { useState } from "react";
import "./Settings.css";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRightIcon,
  CogIcon,
  CircleQuestionMarkIcon,
  PaletteIcon,
  PersonStandingIcon,
  BellDotIcon,
  BellIcon,
  BellOffIcon,
  BellRingIcon,
  EllipsisIcon,
  LanguagesIcon,
  LifeBuoyIcon,
  LightbulbIcon,
  MessageCircleQuestionMarkIcon,
  TimerIcon,
  SunMoonIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";
import { CogIcon as HeroCogIcon } from "@heroicons/react/16/solid";

// TODO: Maybe change the style of the settings, (might too closely resemble Apple's IOS settings app)

function SettingsPage() {
  const navigate = useNavigate();
  const [enableNotifications, setEnableNotifications] = useState(true); // Placeholder for actual state management

  return (
    <div className="lc-page-container select-none">
      <header className="mb-4 mt-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>
      <main className="flex flex-col gap-6 w-full px-1.5">
        <section id="account-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <UserRoundIcon className="size-3.5 text-fuchsia-400" /> Account
          </Label>
          <Item
            variant="muted"
            size="default"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl /*rounded-b-none*/"
            asChild
          >
            <Link to="/settings/account" draggable={false} viewTransition>
              <ItemMedia variant="icon">
                <Avatar
                  className="size-7 not-dark:border not-dark:border-gray-400/75"
                  title="Profile"
                >
                  <AvatarImage
                    src="https://github.com/tgrant06.png"
                    alt="@tgrant06"
                  />
                  <AvatarFallback>TG</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-base /*font-semibold*/">
                  Account
                </ItemTitle>
                {/*Later display name of user or account specific data*/}
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
        <section id="personalization-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <PaletteIcon className="size-3.5 text-blue-400" /> Personalization
          </Label>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl /*rounded-b-none*/"
            asChild
          >
            <Link
              to="/settings/personalization/theme"
              draggable={false}
              viewTransition
            >
              <ItemMedia variant="icon">
                <SunMoonIcon className="size-5 text-amber-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Theme</ItemTitle>
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
          {/*<div className="flex flex-row">
            <div className="shrink-0 w-10.5 h-0 border-t border-t-slate-200/75  dark:border-t-muted/50"></div>
            <div className="flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-slate-300/75 dark:border-t-muted"></div>
            <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
          </div>*/}
          {/*<Item
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
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </Link>
          </Item>*/}
        </section>
        <section id="notification-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <BellDotIcon className="size-3.5 text-red-400" />
            Notifications
          </Label>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 hover:cursor-pointer bg-slate-200/75 dark:bg-muted/50 rounded-2xl rounded-b-none"
            onClick={() => {
              setEnableNotifications(!enableNotifications);
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
              <BellRingIcon
                className={`size-5 text-green-500 transition-all scale-100 rotate-0 ${enableNotifications ? "" : "scale-0! -rotate-90!"}`}
              />
              <BellOffIcon
                className={`absolute size-5 text-gray-500 transition-all scale-100 rotate-0 ${enableNotifications ? "scale-0! rotate-90!" : ""}`}
              />
              {/*<BellDotIcon className="size-5 text-red-500" />*/}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Notifications</ItemTitle>
              {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
            </ItemContent>
            <ItemActions>
              <Switch
                className="data-[state=unchecked]:bg-gray-400 dark:data-[state=unchecked]:bg-gray-700"
                checked={enableNotifications}
                onClick={() => {
                  setEnableNotifications(!enableNotifications);
                }}
              />
            </ItemActions>
          </Item>
          <div className="flex flex-row">
            <div className="shrink-0 w-10.5 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
            <div className="flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-[#c4cbd4] dark:border-t-[#2b3b52]"></div>
            <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
          </div>
          <Item
            variant="muted"
            size="sm"
            className={`group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl rounded-t-none
              ${!enableNotifications ? "opacity-65 pointer-events-none tab" : ""}`}
            asChild
          >
            <button
              onClick={() =>
                navigate("/settings/notifications/duration", {
                  viewTransition: true,
                })
              }
              disabled={!enableNotifications}
              draggable={false}
            >
              <ItemMedia variant="icon">
                <TimerIcon className="size-5 text-orange-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Duration</ItemTitle>
                {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </button>
          </Item>
        </section>
        <section id="general-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <HeroCogIcon className="size-3.5 text-gray-400" /> General
          </Label>
          {/*MAYBE: Add General page in of itself  */}
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl rounded-b-none"
            asChild
          >
            <Link
              to="/settings/general/accessibility"
              draggable={false}
              viewTransition
            >
              <ItemMedia variant="icon">
                <PersonStandingIcon className="size-5 text-teal-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Accessibility</ItemTitle>
                {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </Link>
          </Item>
          <div className="flex flex-row">
            <div className="shrink-0 w-10.5 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
            <div className="flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-[#c4cbd4] dark:border-t-[#2b3b52]"></div>
            <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
          </div>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! */rounded-2xl*/ rounded-none"
            asChild
          >
            <Link
              to="/settings/general/language"
              draggable={false}
              viewTransition
            >
              <ItemMedia variant="icon">
                <LanguagesIcon className="size-5 text-sky-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Language</ItemTitle>
                {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </Link>
          </Item>
          <div className="flex flex-row">
            <div className="shrink-0 w-10.5 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
            <div className="flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-[#c4cbd4] dark:border-t-[#2b3b52]"></div>
            <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
          </div>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! /*rounded-2xl*/ rounded-none"
            asChild
          >
            <Link
              to="/settings/general/privacy-policy"
              draggable={false}
              viewTransition
            >
              <ItemMedia variant="icon">
                <ShieldCheckIcon className="size-5 text-indigo-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Privacy policy</ItemTitle>
                {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </Link>
          </Item>
          <div className="flex flex-row">
            <div className="shrink-0 w-10.5 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
            <div className="flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-[#c4cbd4] dark:border-t-[#2b3b52]"></div>
            <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
          </div>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl rounded-t-none"
            asChild
          >
            <Link
              to="/settings/general/miscellaneous"
              draggable={false}
              viewTransition
            >
              <ItemMedia variant="icon">
                <EllipsisIcon className="size-5 text-slate-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Miscellaneous</ItemTitle>
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
        <section id="help-faq-tipsntricks-section">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <LifeBuoyIcon className="size-3.5 text-pink-400" /> Help
          </Label>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl rounded-b-none"
            asChild
          >
            <Link to="/settings/help" draggable={false} viewTransition>
              <ItemMedia variant="icon">
                <CircleQuestionMarkIcon className="size-5 text-rose-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Help</ItemTitle>
                {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </Link>
          </Item>
          <div className="flex flex-row">
            <div className="shrink-0 w-10.5 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
            <div className="flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-[#c4cbd4] dark:border-t-[#2b3b52]"></div>
            <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
          </div>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! */rounded-2xl*/ rounded-none"
            asChild
          >
            <Link to="/settings/help/faq" draggable={false} viewTransition>
              <ItemMedia variant="icon">
                <MessageCircleQuestionMarkIcon className="size-5 text-violet-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>FAQ</ItemTitle>
                {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </Link>
          </Item>
          <div className="flex flex-row">
            <div className="shrink-0 w-10.5 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
            <div className="flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-[#c4cbd4] dark:border-t-[#2b3b52]"></div>
            <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
          </div>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl rounded-t-none"
            asChild
          >
            <Link
              to="/settings/general/privacy-policy"
              draggable={false}
              viewTransition
            >
              <ItemMedia variant="icon">
                <LightbulbIcon className="size-5 text-yellow-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Tips & Tricks</ItemTitle>
                {/*<ItemDescription>
                  Customize the appearance and behavior of the extension.
                </ItemDescription>*/}
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
              </ItemActions>
            </Link>
          </Item>
          {/*TODO: Terms of service Item */}
        </section>
        <section id="about-license-section"></section>{" "}
        {/*also provide official links and more here*/}
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
