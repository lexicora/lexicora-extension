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
import { SettingsItemSeparator } from "@/components/settings";
import { REPOSITORY_URL } from "@/constants/site";
import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  CodeXmlIcon,
  FileTextIcon,
  ScrollTextIcon,
  TagIcon,
} from "lucide-react";
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
            className="bg-card rounded-2xl not-dark:shadow-xs flex-col items-center pt-6 pb-5 gap-1 text-center"
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

        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="sm"
            className="bg-card rounded-2xl rounded-b-none"
          >
            <ItemContent>
              <ItemDescription className="line-clamp-none text-foreground/80 text-pretty">
                A browser extension for capturing and organizing web content.
                Save pages, highlight text, and write notes — all stored
                locally, always private, fully offline.
              </ItemDescription>
            </ItemContent>
          </Item>
          <SettingsItemSeparator symmetric />
          <Item
            variant="muted"
            size="sm"
            className="bg-card rounded-2xl rounded-t-none"
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

        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-card hover:bg-card-hover! rounded-2xl rounded-b-none"
            asChild
          >
            <Link to="/settings/about/license" draggable={false} viewTransition>
              <ItemMedia variant="icon">
                <ScrollTextIcon className="size-5 text-amber-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>License</ItemTitle>
              </ItemContent>
              <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-lc-muted-foreground-hover" />
            </Link>
          </Item>
          <SettingsItemSeparator />
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-card hover:bg-card-hover! rounded-none"
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
          <SettingsItemSeparator />
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-card hover:bg-card-hover! rounded-2xl rounded-t-none"
            asChild
          >
            {/* The only link out of this page: the source, where an issue can
                be raised and the licence read in context. */}
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
              draggable={false}
            >
              <ItemMedia variant="icon">
                <CodeXmlIcon className="size-5 text-violet-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Source code</ItemTitle>
              </ItemContent>
              {/* An arrow away, not a chevron: this row leaves the extension,
                  unlike the two above it. */}
              <ArrowUpRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-lc-muted-foreground-hover" />
            </a>
          </Item>
          <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
            Lexicora's own terms, the libraries and tools that make it
            possible, and where it is built.
          </p>
        </section>
      </main>
    </PageContainer>
  );
}

export default AboutPage;
