import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SettingsItemSeparator } from "@/components/settings";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { CONTACT_EMAIL, REPOSITORY_URL } from "@/constants/site";
import { ShieldCheckIcon } from "lucide-react";

/**
 * What Lexicora does with your data, which for v1.0 is: keeps it on your
 * machine and sends none of it anywhere.
 *
 * Every claim here has to stay true of the code. The one that needs watching
 * is "makes no requests of its own": it holds because the only `fetch` in the
 * extension reads a font from its own files. A future feature that talks to a
 * server — sync, AI — changes this page before it ships.
 *
 * `PRIVACY.md` at the repository root holds the same text, as the public
 * address the store listings link to. Change both together, date included.
 */

const LAST_UPDATED = "26 September 2026";

const SECTIONS = [
  {
    heading: "What is stored, and where",
    paragraphs: [
      "Your library — topics, entries and their content — is stored by your browser on this device, in its own database for the extension.",
      "Your settings are stored separately: the theme, whether the capture prompt appears and after how long, and the editor's width. If you are signed into your browser and have extension syncing switched on, your browser may carry those few settings to your other devices. That is your browser's own sync, not Lexicora's, and your library is never part of it.",
    ],
  },
  {
    heading: "What leaves your device",
    paragraphs: [
      "Nothing that Lexicora sends. The extension makes no requests of its own to any server.",
      "Your browser still does the ordinary thing when it draws an entry: a site's icon, or an image you added by web address, is loaded from wherever it is hosted, so that host sees a request the same way it would if you opened the page. Nothing about your library is included in it.",
      "Captured pages are read where you are already browsing. Lexicora reads a page only when you ask it to — by capturing, bookmarking, or using the prompt — and it reads the page that is open in front of you, never other tabs and never in the background.",
    ],
  },
  {
    heading: "Why the permissions are needed",
    paragraphs: [
      "Reading the current tab, and running a script in it: to take the page's text and metadata when you capture or bookmark it, and to show the capture prompt.",
      "Storage: to keep your library and settings on this device.",
      "Context menus: to add Lexicora's right-click entries.",
      "Clipboard: to copy an entry or a topic when you ask for it.",
      "The side panel: to open Lexicora beside the page.",
    ],
  },
  {
    heading: "Deleting your data",
    paragraphs: [
      'Settings → Storage → "Clear all data" removes your whole library from this device. Removing the extension from your browser deletes it too. Neither can be undone, so export first if you want a copy.',
    ],
  },
  {
    heading: "Changes",
    paragraphs: [
      "If a future version sends anything anywhere — syncing between your devices, for instance — this page says so before that version ships, and the feature is yours to switch on rather than something that happens quietly.",
    ],
  },
] as const;

function PrivacyPolicySettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Privacy policy" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-2 text-left">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon" className="-ml-0.75">
                <ShieldCheckIcon className="size-8 text-indigo-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                Lexicora keeps everything you capture on your own computer.
              </ItemDescription>
              <ItemDescription className="text-pretty line-clamp-none mt-1.5">
                It has no accounts, no servers and no analytics, and it sends
                nothing about you or your browsing anywhere.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>

        <section className="not-dark:shadow-xs rounded-2xl">
          {SECTIONS.map(({ heading, paragraphs }, index) => {
            const isFirst = index === 0;
            const isLast = index === SECTIONS.length - 1;
            const roundingClass = isFirst
              ? "rounded-2xl rounded-b-none"
              : isLast
                ? "rounded-2xl rounded-t-none"
                : "rounded-none";

            return (
              <div key={heading}>
                {index > 0 && <SettingsItemSeparator symmetric />}
                <Item
                  variant="muted"
                  size="sm"
                  className={`bg-card ${roundingClass}`}
                >
                  <ItemContent>
                    <ItemTitle>{heading}</ItemTitle>
                    {paragraphs.map((paragraph) => (
                      <ItemDescription
                        key={paragraph}
                        className="line-clamp-none text-pretty"
                      >
                        {paragraph}
                      </ItemDescription>
                    ))}
                  </ItemContent>
                </Item>
              </div>
            );
          })}
        </section>

        <p className="text-xs text-muted-foreground mx-2.5 -mt-4 text-pretty text-left">
          Last updated {LAST_UPDATED}. Questions, or something here that does
          not match what you see? Write to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="underline underline-offset-2 hover:text-lc-muted-foreground-hover"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          or{" "}
          <a
            href={`${REPOSITORY_URL}/issues`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-lc-muted-foreground-hover"
          >
            open an issue
          </a>
          .
        </p>
      </main>
    </PageContainer>
  );
}

export default PrivacyPolicySettingsPage;
