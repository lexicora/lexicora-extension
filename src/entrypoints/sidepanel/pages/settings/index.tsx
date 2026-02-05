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
  CameraIcon,
  CameraOffIcon,
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
  FileTextIcon,
  HeartPlusIcon,
  InfoIcon,
  LanguagesIcon,
  LifeBuoyIcon,
  LightbulbIcon,
  MessageCircleQuestionMarkIcon,
  TimerIcon,
  SunMoonIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";
import { SparklesIcon } from "@heroicons/react/24/solid";
import {
  CogIcon as HeroCogIcon,
  SparklesIcon as HeroSparklesIcon,
  InformationCircleIcon as HeroInformationCircleIcon,
} from "@heroicons/react/16/solid";

import { SettingsItemSeperator } from "@/entrypoints/sidepanel/components/ui/settings-item-seperator";
import { SettingsItem } from "@/entrypoints/sidepanel/components/ui/settings-item";

// TODO: Maybe change the style of the settings, (might too closely resemble Apple's IOS settings app)

function SettingsPage() {
  const navigate = useNavigate();
  const [enableNotifications, setEnableNotifications] = useState(true); // Placeholder for actual state management

  return (
    <div className="lc-page-container select-none">
      <div className="lc-page-container-inner">
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
            {/*TODO MAYBE: Add subscription settings right below above or put it in the account settings */}
          </section>
          <section id="ai-settings">
            <Label htmlFor="" className="text-sm ml-2 mb-0.5">
              <HeroSparklesIcon className="size-3.5 text-cyan-400" /> AI
            </Label>
            <SettingsItem
              to="/settings/ai"
              size="sm"
              MediaIcon={SparklesIcon}
              mediaIconColor="text-purple-500"
              itemTitle="AI Settings"
              roundingClass=""
            />
          </section>
          <section id="personalization-settings">
            <Label htmlFor="" className="text-sm ml-2 mb-0.5">
              <PaletteIcon className="size-3.5 text-blue-400" /> Personalization
            </Label>
            <SettingsItem
              to="/settings/personalization/theme"
              size="sm"
              MediaIcon={SunMoonIcon}
              mediaIconColor="text-amber-500"
              itemTitle="Theme"
              roundingClass=""
            />
            {/*<div className="flex flex-row">
            <div className="shrink-0 w-10.5 h-0 border-t border-t-slate-200/75  dark:border-t-muted/50"></div>
            <div className="flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-slate-300/75 dark:border-t-muted"></div>
            <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
          </div>*/}
          </section>
          {/*NOTE: Firefox does not support Notifications currently */}
          {import.meta.env.FIREFOX ? null : (
            //TODO: Maybe put in entire separate page
            <section id="notification-settings">
              <Label htmlFor="" className="text-sm ml-2 mb-0.5">
                <CameraIcon className="size-3.5 text-red-400" />
                Capture Suggestions
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
                  <CameraIcon
                    className={`size-5 text-green-500 transition-all scale-100 rotate-0 ${enableNotifications ? "" : "scale-0! -rotate-90!"}`}
                  />
                  <CameraOffIcon
                    className={`absolute size-5 text-gray-500 transition-all scale-100 rotate-0 ${enableNotifications ? "scale-0! rotate-90!" : ""}`}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Capture Suggestions</ItemTitle>
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
              <SettingsItemSeperator />
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
                    <ItemTitle>Delay</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
                  </ItemActions>
                </button>
              </Item>
              {/*Add website exclusions of notifications setting */}
            </section>
          )}
          <section id="general-settings">
            <Label htmlFor="" className="text-sm ml-2 mb-0.5">
              <HeroCogIcon className="size-3.5 text-gray-400" /> General
            </Label>
            {/*MAYBE: Add General page in of itself  */}
            <SettingsItem
              to="/settings/general/accessibility"
              size="sm"
              MediaIcon={PersonStandingIcon}
              mediaIconColor="text-teal-500"
              itemTitle="Accessibility"
              roundingClass="rounded-b-none"
            />
            <SettingsItem
              to="/settings/general/language"
              size="sm"
              MediaIcon={LanguagesIcon}
              mediaIconColor="text-sky-500"
              itemTitle="Language"
              roundingClass="rounded-none!"
            />
            <SettingsItem
              //Maybe make this an external link
              to="/settings/general/privacy-policy"
              size="sm"
              MediaIcon={ShieldCheckIcon}
              mediaIconColor="text-indigo-500"
              itemTitle="Privacy policy"
              roundingClass="rounded-none!"
            />
            <SettingsItem
              to="/settings/general/miscellaneous"
              size="sm"
              MediaIcon={EllipsisIcon}
              mediaIconColor="text-slate-500"
              itemTitle="Miscellaneous"
              roundingClass="rounded-t-none"
            />
          </section>
          <section id="help-faq-tipsntricks-section">
            <Label htmlFor="" className="text-sm ml-2 mb-0.5">
              <LifeBuoyIcon className="size-3.5 text-pink-400" /> Help
            </Label>
            <SettingsItem
              // Maybe drop the /support and just have it link to settings/help
              to="/settings/help/support"
              size="sm"
              MediaIcon={HeartPlusIcon}
              mediaIconColor="text-rose-500"
              itemTitle="Support"
              roundingClass="rounded-b-none"
            />
            <SettingsItem
              to="/settings/help/faq"
              size="sm"
              MediaIcon={MessageCircleQuestionMarkIcon}
              mediaIconColor="text-violet-500"
              itemTitle="FAQ"
              roundingClass="rounded-none!"
            />
            <SettingsItem
              to="/settings/help/tips-and-tricks"
              size="sm"
              MediaIcon={LightbulbIcon}
              mediaIconColor="text-yellow-500"
              itemTitle="Tips & Tricks"
              roundingClass="rounded-t-none"
            />
            {/*TODO: Terms of service Item */}
          </section>
          <section id="about-license-section" className="mb-2.5">
            <Label htmlFor="" className="text-sm ml-2 mb-0.5">
              <HeroInformationCircleIcon className="size-3.5 text-teal-400" />{" "}
              About
            </Label>
            <SettingsItem
              to="/settings/about"
              size="sm"
              MediaIcon={InfoIcon}
              mediaIconColor="text-blue-500"
              itemTitle="About"
              roundingClass="rounded-b-none"
            />
            <SettingsItem
              to="/settings/about/licenses"
              size="sm"
              MediaIcon={FileTextIcon}
              mediaIconColor="text-emerald-500"
              itemTitle="Licenses"
              roundingClass="rounded-t-none"
            />
          </section>
          {/*<SettingsItem
          to="/settings/general/terms-of-service"
          size="sm"
          MediaIcon={CogIcon}
          mediaIconColor="text-gray-500"
          itemTitle="Terms of Service"
          roundingClass="rounded-none!"
        />*/}
          {/*<SettingsItem
          to="/settings/help/contact-us"
          size="sm"
          MediaIcon={CircleQuestionMarkIcon}
          mediaIconColor="text-green-500"
          itemTitle="Contact Us"
          roundingClass="rounded-none!"
        />*/}
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
    </div>
  );
}

export default SettingsPage;
