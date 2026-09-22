//import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  CogIcon as HeroCogIcon,
  InformationCircleIcon as HeroInformationCircleIcon,
} from "@heroicons/react/16/solid";
import { SparklesIcon } from "@heroicons/react/24/solid";
import {
  ArrowUpRightIcon,
  CameraIcon,
  ChevronRightIcon,
  DatabaseIcon,
  DownloadIcon,
  HardDriveIcon,
  //EllipsisIcon, // used by the commented-out General items below
  //FileTextIcon,
  HeartPlusIcon,
  HistoryIcon,
  InfoIcon,
  KeyboardIcon,
  //LanguagesIcon, // used by the commented-out General items below
  LifeBuoyIcon,
  LightbulbIcon,
  MessageCircleQuestionMarkIcon,
  PaletteIcon,
  RocketIcon,
  //PersonStandingIcon, // used by the commented-out General items below
  Settings2Icon,
  ShieldCheckIcon,
  SunMoonIcon,
  UploadIcon,
  UserIcon,
  UserRoundIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
//import styles from "./settings-page.module.css";

import { FEATURES } from "@/constants/features";
import { SettingsItem, SettingsItemSeparator } from "@/components/settings";
import { onboardingUrl } from "@/lib/onboarding";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";

// MAYBE: Convert this whole page full of options to a data list, that gets iterated over.

function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Settings" />
      <main className="flex flex-col gap-5.75 w-full px-1 mb-2">
        {FEATURES.ACCOUNTS && (
          <section id="account-settings">
            <Label htmlFor="" className="text-sm ml-2 mb-0.5">
              <UserRoundIcon className="size-3.5 text-fuchsia-400" /> Account
            </Label>
            <Item
              variant="muted"
              size="default"
              className="group transition-colors duration-150 bg-card hover:bg-card-hover! rounded-2xl /*rounded-b-none*/ not-dark:shadow-xs"
              asChild
            >
              <Link to="/settings/account" draggable={false} viewTransition>
                <ItemMedia variant="icon">
                  {/* <Avatar
                    className="size-7 not-dark:border not-dark:border-gray-400/75"
                    title="Profile"
                  >
                    <AvatarImage
                      src="https://github.com/tgmaurer.png"
                      alt="@tgmaurer"
                    />
                    <AvatarFallback>TG</AvatarFallback>
                  </Avatar> */}
                  <div className="size-8 rounded-md flex items-center">
                    <div className="flex items-center justify-center size-full rounded-full bg-secondary/25 dark:bg-secondary/50 ring ring-inset ring-black/20 dark:ring-white/20">
                      <UserIcon className="size-4.5" />
                      {/* TODO (FEATURES.ACCOUNTS): If logged in, show user's avatar or initials */}
                    </div>
                  </div>
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
                  <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-lc-muted-foreground-hover" />
                </ItemActions>
              </Link>
            </Item>
            {/*MAYBE (FEATURES.ACCOUNTS): Add subscription settings right below above or put it in the account settings */}
          </section>
        )}
        <section id="features-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <Settings2Icon className="size-3.5 text-cyan-400" /> Features
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
            {FEATURES.AI && (
              <SettingsItem
                to="/settings/ai"
                size="sm"
                MediaIcon={SparklesIcon}
                mediaIconColor="text-purple-500"
                itemTitle="AI Settings"
                roundingClass="rounded-b-none"
              />
            )}
            {import.meta.env.FIREFOX ? (
              <SettingsItem
                to="/not-supported"
                size="sm"
                MediaIcon={CameraIcon}
                mediaIconColor="text-red-500"
                itemTitle="Capture Suggestions"
                roundingClass={FEATURES.AI ? "rounded-none!" : "rounded-b-none"}
                disabled
                disabledReason="Not supported in Firefox based browsers"
              />
            ) : (
              <SettingsItem
                to="/settings/capture-suggestions"
                size="sm"
                MediaIcon={CameraIcon}
                mediaIconColor="text-red-500"
                itemTitle="Capture Suggestions"
                roundingClass={FEATURES.AI ? "rounded-none!" : "rounded-b-none"}
              />
              //Add reminder feature, that reminds the user if he already has an entry with the same URL of the current page.
            )}
            <SettingsItem
              to="/settings/keyboard-shortcuts"
              size="sm"
              MediaIcon={KeyboardIcon}
              mediaIconColor="text-slate-500"
              itemTitle="Keyboard Shortcuts"
              roundingClass="rounded-t-none"
            />
          </div>
        </section>
        <section id="personalization-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <PaletteIcon className="size-3.5 text-blue-400" /> Personalization
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
            <SettingsItem
              to="/settings/personalization/theme"
              size="sm"
              MediaIcon={SunMoonIcon}
              mediaIconColor="text-amber-500"
              itemTitle="Theme"
              roundingClass=""
            />
          </div>
        </section>
        <section id="data-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <DatabaseIcon className="size-3.5 text-emerald-400" /> Data
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
            <SettingsItem
              to="/settings/data/export"
              size="sm"
              MediaIcon={UploadIcon}
              mediaIconColor="text-emerald-500"
              itemTitle="Export"
              roundingClass="rounded-b-none"
            />
            <SettingsItem
              to="/settings/data/import"
              size="sm"
              MediaIcon={DownloadIcon}
              mediaIconColor="text-cyan-500"
              itemTitle="Import"
              roundingClass="rounded-none!"
            />
            <SettingsItem
              to="/settings/data/storage"
              size="sm"
              MediaIcon={HardDriveIcon}
              mediaIconColor="text-sky-500"
              itemTitle="Storage"
              roundingClass="rounded-t-none"
            />
          </div>
        </section>
        <section id="general-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <HeroCogIcon className="size-3.5 text-gray-400" /> General
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
            {/*MAYBE: Add General page in of itself  */}
            {/* Accessibility, Language and Miscellaneous are not built: each
                linked to a route that does not exist and opened the
                not-found page. Bring one back with its page.
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
              to="/settings/general/miscellaneous"
              size="sm"
              MediaIcon={EllipsisIcon}
              mediaIconColor="text-slate-500"
              itemTitle="Miscellaneous"
              roundingClass="rounded-t-none"
            /> */}
            <SettingsItem
              //Maybe make this an external link
              to="/settings/general/privacy-policy"
              size="sm"
              MediaIcon={ShieldCheckIcon}
              mediaIconColor="text-indigo-500"
              itemTitle="Privacy policy"
            />
          </div>
        </section>
        <section id="help-faq-tipsntricks-section">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <LifeBuoyIcon className="size-3.5 text-pink-400" /> Help
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
            <Item
              variant="muted"
              size="sm"
              className="group transition-colors duration-150 bg-card hover:bg-card-hover! rounded-2xl rounded-b-none"
              asChild
            >
              {/* The page shown on install, in a tab of its own again. */}
              <a
                href={onboardingUrl()}
                target="_blank"
                rel="noreferrer"
                draggable={false}
              >
                <ItemMedia variant="icon">
                  <RocketIcon className="size-5 text-sky-500" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Getting started</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ArrowUpRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-lc-muted-foreground-hover" />
                </ItemActions>
              </a>
            </Item>
            <SettingsItemSeparator />
            <SettingsItem
              // Maybe drop the /support and just have it link to settings/help
              to="/settings/help/support"
              size="sm"
              MediaIcon={HeartPlusIcon}
              mediaIconColor="text-rose-500"
              itemTitle="Support"
              roundingClass="rounded-none!"
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
          </div>
          {/*TODO (release prep): Terms of service Item */}
        </section>
        <section id="about-license-section">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <HeroInformationCircleIcon className="size-3.5 text-teal-400" />{" "}
            About
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
            <SettingsItem
              to="/settings/about"
              size="sm"
              MediaIcon={InfoIcon}
              mediaIconColor="text-blue-500"
              itemTitle="About"
              roundingClass="rounded-b-none"
            />
            <SettingsItem
              to="/settings/about/whats-changed"
              size="sm"
              MediaIcon={HistoryIcon}
              mediaIconColor="text-orange-500"
              itemTitle="What's Changed"
              roundingClass="rounded-t-none"
            />
            {/* <SettingsItem
              to="/settings/about/licenses"
              size="sm"
              MediaIcon={FileTextIcon}
              mediaIconColor="text-emerald-500"
              itemTitle="Licenses"
              roundingClass="rounded-t-none"
            /> */}
          </div>
        </section>
      </main>
    </PageContainer>
  );
}

export default SettingsPage;
