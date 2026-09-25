import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemHeader,
} from "@/components/ui/item";
import { SettingsItemSeparator } from "@/components/settings";
import {
  ArchiveIcon,
  BookmarkIcon,
  GlobeIcon,
  KeyboardIcon,
  CameraIcon,
  FolderOpenIcon,
  HandGrabIcon,
  HashIcon,
  LightbulbIcon,
  MousePointerClickIcon,
  PinIcon,
  SearchIcon,
  SquareSlashIcon,
  TagIcon,
  TextSelectIcon,
  TriangleAlertIcon,
  WrapTextIcon,
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
    icon: TextSelectIcon,
    iconColor: "text-teal-500",
    title: "When a capture comes back empty",
    description:
      "A capture keeps what a page is about and leaves out its menus, link lists and buttons, so a landing page or a web app can have little it recognises as content. Select what you want and capture that instead: Capture Selection in the right-click menu, or the capture shortcut, which takes the selection whenever there is one.",
  },
  {
    icon: HandGrabIcon,
    iconColor: "text-orange-500",
    title: "Drag and drop from the page",
    description:
      "While editing an entry, drag selected text or images from the page straight into the editor. It works alongside Capture Selection and is cleaned up the same way.",
  },
  {
    icon: MousePointerClickIcon,
    iconColor: "text-pink-500",
    title: "Right-click to select a block",
    description:
      "Right-click the drag handle next to a block to select all of its content and bring up the formatting toolbar. A regular click still opens the block menu.",
  },
  {
    icon: SquareSlashIcon,
    iconColor: "text-sky-500",
    title: "Every block from one key",
    description:
      "Type / in the editor for a menu of every block — headings, lists, tables, images, code, alerts and more — and keep typing to narrow it down.",
  },
  {
    icon: HashIcon,
    iconColor: "text-fuchsia-500",
    title: "Markdown as you type",
    description:
      "Start a line with # and a space for a heading (## and ### for smaller ones), - for a bullet list, 1. for a numbered list, [ ] for a checklist, > for a quote, ``` for a code block or --- for a divider. **Bold**, *italic* and `code` work within a line.",
  },
  {
    icon: WrapTextIcon,
    iconColor: "text-indigo-500",
    title: "New line in the same block",
    description:
      "Press Shift+Enter in the editor to start a new line without creating a new block, so the lines stay part of the same paragraph, list item or heading.",
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
      "The search bar scans titles, tags, descriptions, site names and dates. For one website exactly, type site:react.dev — alone, or with words after it to search within that site.",
  },
  {
    icon: BookmarkIcon,
    iconColor: "text-emerald-500",
    title: "Add your own notes",
    description:
      "Every entry has a rich text editor for your own notes, highlights, and thoughts. Use it to annotate what you captured and why.",
  },
  {
    icon: TriangleAlertIcon,
    iconColor: "text-amber-500",
    title: "Call out what matters",
    description:
      "Type /alert in the editor for a coloured callout — note, tip, important, warning or caution. Exported Markdown writes them the way GitHub does, so they still read as callouts in GitHub, Obsidian and anywhere else that understands them.",
  },
  {
    icon: KeyboardIcon,
    iconColor: "text-slate-500",
    title: "Keys for the things you do often",
    description:
      "With the side panel focused: n for a new entry, Shift+N for a new topic, e to edit what is open, / to search, and ? for the full list.",
  },
  {
    icon: GlobeIcon,
    iconColor: "text-blue-500",
    title: "Everything from this site",
    description:
      "The home page shows what you already have from the site you are on. The link beside that group opens the Library filtered to it, however many there are.",
  },
] as const;

function TipsAndTricksPage() {
  return (
    <PageContainer>
      <PageHeader title="Tips & Tricks" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-2">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon" className="-ml-1">
                <LightbulbIcon className="size-8 text-yellow-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                Some tips and tricks to help you get the most out of Lexicora.
                These are just a few ways to make your library more organized,
                searchable, and useful.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>
        <section className="not-dark:shadow-xs rounded-2xl">
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
                {i > 0 && <SettingsItemSeparator />}
                <Item
                  variant="muted"
                  size="sm"
                  className={`bg-card ${roundingClass}`}
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
