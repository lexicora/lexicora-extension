import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { SettingsItemSeperator } from "@/components/settings";
import { ChevronRightIcon, FileTextIcon, TagIcon } from "lucide-react";
import { Link } from "react-router-dom";

function AboutPage() {
  const version = browser.runtime.getManifest().version;

  return (
    <PageContainer>
      <PageHeader title="About" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-1">
        <section>
          <Item
            variant="muted"
            size="default"
            className="bg-slate-200/75 dark:bg-muted/50 rounded-2xl flex-col items-center py-6 gap-2 text-center"
          >
            <span className="flex justify-center gap-1.5 items-baseline mb-3">
              {/*Maybe add link to lexicora.com */}
              <img
                src={lexicoraLightThemeLogoNoBg}
                className="h-[1.06rem] lc-display-light rounded-xs"
                alt="Lexicora logo"
                draggable="false"
              />
              <img
                src={lexicoraDarkThemeLogoNoBg}
                className="h-[1.06rem] lc-display-dark rounded-xs"
                alt="Lexicora logo"
                draggable="false"
              />
              {/*#00143d is the Lexicora color */}
              <h2 className="text-2xl font-bold text-[#00143d] dark:text-foreground leading-0">
                Lexicora
              </h2>
            </span>
            {/*<h2 className="text-2xl font-bold tracking-tight">Lexicora</h2>*/}
            <p className="text-xs text-muted-foreground">
              Capture. Organize. Remember.
            </p>
          </Item>
        </section>

        <section>
          <Item
            variant="muted"
            size="sm"
            className="bg-slate-200/75 dark:bg-muted/50 rounded-2xl rounded-b-none"
          >
            <ItemContent>
              <ItemDescription className="line-clamp-none text-foreground/80 text-pretty">
                A browser extension for capturing and organizing web content.
                Save pages, highlight text, and write notes — all stored
                locally, always private, fully offline.
              </ItemDescription>
            </ItemContent>
          </Item>
          <SettingsItemSeperator />
          <Item
            variant="muted"
            size="sm"
            className="bg-slate-200/75 dark:bg-muted/50 rounded-2xl rounded-t-none"
          >
            <ItemMedia variant="icon">
              <TagIcon className="size-5 text-muted-foreground" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Version</ItemTitle>
            </ItemContent>
            <span className="text-sm text-muted-foreground ml-auto">
              {version}
            </span>
          </Item>
        </section>

        <section>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl"
            asChild
          >
            <Link
              to="/settings/about/licenses"
              draggable={false}
              viewTransition
            >
              <ItemMedia variant="icon">
                <FileTextIcon className="size-5 text-emerald-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Open Source Licenses</ItemTitle>
              </ItemContent>
              <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-lc-muted-foreground-hover" />
            </Link>
          </Item>
          <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-1">
            Libraries and tools that make Lexicora possible.
          </p>
        </section>
      </main>
    </PageContainer>
  );
}

export default AboutPage;
