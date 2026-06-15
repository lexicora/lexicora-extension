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
import {
  ArchiveIcon,
  BookmarkIcon,
  CameraIcon,
  FolderOpenIcon,
  PinIcon,
  SearchIcon,
  TagIcon,
} from "lucide-react";

const TIPS = [
  {
    icon: CameraIcon,
    iconColor: "text-red-500",
    title: "Tune capture suggestions",
    description:
      "Adjust the capture prompt delay in Settings → Capture Suggestions so it appears after the right amount of time for your browsing habits.",
  },
  {
    icon: FolderOpenIcon,
    iconColor: "text-blue-500",
    title: "Organize with topics",
    description:
      "Create topics for projects, research areas, or themes. Assign entries to topics when capturing so related content stays together.",
  },
  {
    icon: TagIcon,
    iconColor: "text-violet-500",
    title: "Tag across topics",
    description:
      "Tags let you cross-reference entries across different topics. Use consistent tags to find related content at a glance.",
  },
  {
    icon: PinIcon,
    iconColor: "text-amber-500",
    title: "Pin what matters",
    description:
      "Pin important entries or topics to keep them at the top of your lists so you can get back to them quickly.",
  },
  {
    icon: ArchiveIcon,
    iconColor: "text-slate-500",
    title: "Archive to declutter",
    description:
      "Archive entries you want to keep but don't need front and center. Archived entries are hidden from the main list but remain searchable.",
  },
  {
    icon: SearchIcon,
    iconColor: "text-cyan-500",
    title: "Search is powerful",
    description:
      "The search bar scans titles, tags, descriptions, and site names. Try searching by domain name to find all captures from a site.",
  },
  {
    icon: BookmarkIcon,
    iconColor: "text-emerald-500",
    title: "Add your own notes",
    description:
      "Every entry has a rich text editor for your own notes, highlights, and thoughts. Use it to annotate what you captured and why.",
  },
] as const;

function TipsAndTricksPage() {
  return (
    <PageContainer>
      <PageHeader title="Tips & Tricks" goBackButton />
      <main className="flex flex-col gap-0 w-full pt-4.5 px-1 mb-1.75">
        <section>
          {TIPS.map((tip, i) => {
            const isFirst = i === 0;
            const isLast = i === TIPS.length - 1;
            const roundingClass = isFirst
              ? "rounded-2xl rounded-b-none"
              : isLast
                ? "rounded-2xl rounded-t-none"
                : "rounded-none";

            return (
              <div key={tip.title}>
                {i > 0 && <SettingsItemSeperator />}
                <Item
                  variant="muted"
                  size="sm"
                  className={`bg-card dark:bg-muted/50 ${roundingClass}`}
                >
                  <ItemMedia variant="icon">
                    <tip.icon className={`size-5 ${tip.iconColor}`} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{tip.title}</ItemTitle>
                    <ItemDescription className="line-clamp-none text-pretty">
                      {tip.description}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </div>
            );
          })}
        </section>
      </main>
    </PageContainer>
  );
}

export default TipsAndTricksPage;
