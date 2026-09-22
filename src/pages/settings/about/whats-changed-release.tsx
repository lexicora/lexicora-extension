import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SettingsItemSeparator } from "@/components/settings";
import { Item, ItemContent, ItemDescription } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  CHANGE_KINDS,
  findRelease,
  formatReleaseDate,
  type ChangeKind,
} from "@/constants/changelog";
import { cn } from "cn";
import { SparklesIcon, TrendingUpIcon, WrenchIcon } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";

import { InstalledBadge } from "./installed-badge";

const GROUPS: Record<
  ChangeKind,
  { heading: string; icon: typeof SparklesIcon; iconColor: string }
> = {
  new: { heading: "New", icon: SparklesIcon, iconColor: "text-violet-400" },
  improved: {
    heading: "Improved",
    icon: TrendingUpIcon,
    iconColor: "text-blue-400",
  },
  fixed: { heading: "Fixed", icon: WrenchIcon, iconColor: "text-emerald-400" },
};

/** Rounds the first and last row of a stacked card only. */
function rowRounding(index: number, count: number): string {
  if (count === 1) return "rounded-2xl";
  if (index === 0) return "rounded-2xl rounded-b-none";
  if (index === count - 1) return "rounded-2xl rounded-t-none";
  return "rounded-none";
}

/** One release's changes, grouped into new, improved and fixed. */
function WhatsChangedReleasePage() {
  const { version } = useParams();
  const release = findRelease(version);
  // Only reachable from the list, but a stale history entry could name a
  // version this build does not know.
  if (!release) return <Navigate to="/settings/about/whats-changed" replace />;

  const isInstalled = release.version === browser.runtime.getManifest().version;

  return (
    <PageContainer>
      <PageHeader title={`Version ${release.version}`} goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-2 text-left">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="py-3 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none text-foreground">
                {release.summary}
              </ItemDescription>
              {(release.date || isInstalled) && (
                <ItemDescription className="flex items-center gap-1.5 mt-1.5">
                  {release.date && formatReleaseDate(release.date)}
                  {isInstalled && <InstalledBadge />}
                </ItemDescription>
              )}
            </ItemContent>
          </Item>
        </section>

        {CHANGE_KINDS.map((kind) => {
          const changes = release.changes[kind];
          if (!changes?.length) return null;
          const group = GROUPS[kind];
          return (
            <section key={kind}>
              <Label className="text-sm ml-2 mb-0.5">
                <group.icon className={cn("size-3.5", group.iconColor)} />{" "}
                {group.heading}
              </Label>
              <div className="rounded-2xl not-dark:shadow-xs">
                {changes.map((change, index) => (
                  <div key={change}>
                    {index > 0 && <SettingsItemSeparator symmetric />}
                    <Item
                      variant="muted"
                      size="sm"
                      className={cn(
                        "bg-card transition-none",
                        rowRounding(index, changes.length),
                      )}
                    >
                      <ItemContent>
                        <span className="text-sm text-pretty">{change}</span>
                      </ItemContent>
                    </Item>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </PageContainer>
  );
}

export default WhatsChangedReleasePage;
