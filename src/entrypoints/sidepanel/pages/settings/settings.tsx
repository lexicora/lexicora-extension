import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  CameraIcon,
  ChevronRightIcon,
  DatabaseIcon,
  EllipsisIcon,
  FileTextIcon,
  HeartPlusIcon,
  InfoIcon,
  LanguagesIcon,
  LifeBuoyIcon,
  LightbulbIcon,
  MessageCircleQuestionMarkIcon,
  PaletteIcon,
  PersonStandingIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SunMoonIcon,
  UserIcon,
  UserRoundIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
//import styles from "./settings-page.module.css";

import { SettingsItem } from "@/components/settings";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";

// TODO: Maybe convert this whole page full of options to a data list, that gets iterated over.

function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Settings" />
      <main className="flex flex-col gap-5.75 w-full px-1">
        <section id="account-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <UserRoundIcon className="size-3.5 text-fuchsia-400" /> Account
          </Label>
          <Item
            variant="muted"
            size="default"
            className="group transition-colors duration-150 bg-card hover:bg-card-hover! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl /*rounded-b-none*/ not-dark:shadow-xs"
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
                  <div className="flex items-center justify-center size-full rounded-full bg-secondary/50 ring ring-inset ring-black/20 dark:ring-white/20">
                    <UserIcon className="size-4.5" />
                    {/* TODO: If logged in, show user's avatar or initials */}
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
          {/*TODO MAYBE: Add subscription settings right below above or put it in the account settings */}
        </section>
        <section id="ai-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <Settings2Icon className="size-3.5 text-cyan-400" /> Features
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
            <SettingsItem
              to="/settings/ai"
              size="sm"
              MediaIcon={SparklesIcon}
              mediaIconColor="text-purple-500"
              itemTitle="AI Settings"
              roundingClass="rounded-b-none"
            />
            {import.meta.env.FIREFOX ? (
              <SettingsItem
                to="/not-supported"
                size="sm"
                MediaIcon={CameraIcon}
                mediaIconColor="text-red-500"
                itemTitle="Capture Suggestions"
                roundingClass="rounded-t-none"
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
                roundingClass="rounded-t-none"
              />
              //Add reminder feature, that reminds the user if he already has an entry with the same URL of the current page.
            )}
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
              to="/settings/data"
              size="sm"
              MediaIcon={DatabaseIcon}
              mediaIconColor="text-emerald-500"
              itemTitle="Data Management"
              roundingClass=""
            />
          </div>
        </section>
        <section id="general-settings">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <HeroCogIcon className="size-3.5 text-gray-400" /> General
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
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
          </div>
        </section>
        <section id="help-faq-tipsntricks-section">
          <Label htmlFor="" className="text-sm ml-2 mb-0.5">
            <LifeBuoyIcon className="size-3.5 text-pink-400" /> Help
          </Label>
          <div className="rounded-2xl not-dark:shadow-xs">
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
          </div>
          {/*TODO: Terms of service Item */}
        </section>
        <section id="about-license-section" className="mb-1.75">
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
              to="/settings/about/licenses"
              size="sm"
              MediaIcon={FileTextIcon}
              mediaIconColor="text-emerald-500"
              itemTitle="Licenses"
              roundingClass="rounded-t-none"
            />
          </div>
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
    </PageContainer>
  );
}

export default SettingsPage;
