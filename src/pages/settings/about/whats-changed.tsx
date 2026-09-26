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
import {
  formatReleaseDate,
  RELEASES,
  type Release,
} from "@/constants/changelog";
import { cn } from "cn";
import { ChevronRightIcon, HistoryIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { InstalledBadge } from "./installed-badge";

/** Rounds the first and last row of a stacked card only. */
function rowRounding(index: number, count: number): string {
  if (count === 1) return "rounded-2xl";
  if (index === 0) return "rounded-2xl rounded-b-none";
  if (index === count - 1) return "rounded-2xl rounded-t-none";
  return "rounded-none";
}

function ReleaseRow({
  release,
  isInstalled,
  rounding,
}: {
  release: Release;
  isInstalled: boolean;
  rounding: string;
}) {
  return (
    <Item
      variant="muted"
      size="sm"
      className={cn(
        "group transition-colors duration-150 bg-card hover:bg-card-hover!",
        rounding,
      )}
      asChild
    >
      <Link
        to={`/settings/about/whats-changed/${release.version}`}
        draggable={false}
        viewTransition
      >
        <ItemContent>
          <ItemTitle>
            Version {release.version}
            {release.date && (
              <>
                <span>·</span>
                <span className="font-normal text-lc-muted-foreground">
                  {formatReleaseDate(release.date, "medium")}
                </span>
              </>
            )}
            {isInstalled && <InstalledBadge className="ml-1" />}
          </ItemTitle>
          <ItemDescription className="line-clamp-2 text-pretty">
            {release.summary}
          </ItemDescription>
        </ItemContent>
        <ChevronRightIcon className="size-4 shrink-0 transition-colors duration-150 text-muted-foreground group-hover:text-lc-muted-foreground-hover" />
      </Link>
    </Item>
  );
}

/** Every release, newest first; each opens its own page. */
function WhatsChangedPage() {
  const installed = browser.runtime.getManifest().version;

  return (
    <PageContainer>
      <PageHeader title="What's Changed" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-2 text-left">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon">
                <HistoryIcon className="size-8 text-orange-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                What each version of Lexicora added, improved and fixed, newest
                first.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>

        <section className="not-dark:shadow-xs rounded-2xl">
          {RELEASES.map((release, index) => (
            <div key={release.version}>
              {index > 0 && <SettingsItemSeparator symmetric />}
              <ReleaseRow
                release={release}
                isInstalled={release.version === installed}
                rounding={rowRounding(index, RELEASES.length)}
              />
            </div>
          ))}
        </section>
      </main>
    </PageContainer>
  );
}

export default WhatsChangedPage;
