import {
  ArchiveIcon,
  BookmarkIcon,
  CameraIcon,
  FolderOpenIcon,
  GlobeIcon,
  HandGrabIcon,
  HashIcon,
  KeyboardIcon,
  LibraryBigIcon,
  MousePointerClickIcon,
  PenLineIcon,
  PinIcon,
  ScanTextIcon,
  SearchIcon,
  SquareSlashIcon,
  TagIcon,
  TextSelectIcon,
  TriangleAlertIcon,
  WrapTextIcon,
  type LucideIcon,
} from "lucide-react";

/**
 * Settings → Help → Tips & Tricks, one page per category. The list page
 * shows the categories in this order — capture, write, find, the order the
 * app is used in — and each opens its own page of tips.
 *
 * A new tip is one more entry in its category.
 */

export interface Tip {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
}

export interface TipCategory {
  /** The last part of the category page's path. */
  id: string;
  title: string;
  /** What the category covers, on the list page. */
  summary: string;
  icon: LucideIcon;
  iconColor: string;
  tips: readonly Tip[];
}

// NOTE: Feature parity discrepancy — Firefox has no capture suggestions.
const captureSuggestionTips: Tip[] = import.meta.env.FIREFOX
  ? []
  : [
      {
        icon: CameraIcon,
        iconColor: "text-red-500",
        title: "Tune capture suggestions",
        description:
          "Adjust the capture prompt delay in Settings → Capture Suggestions so it appears after the right amount of time for your browsing habits.",
      },
    ];

export const TIP_CATEGORIES: readonly TipCategory[] = [
  {
    id: "capturing",
    title: "Capturing",
    summary: "Getting pages, selections and images in",
    icon: ScanTextIcon,
    iconColor: "text-red-500",
    tips: [
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
      ...captureSuggestionTips,
    ],
  },
  {
    id: "editor",
    title: "Editor",
    summary: "Writing and formatting your entries",
    icon: PenLineIcon,
    iconColor: "text-fuchsia-500",
    tips: [
      {
        icon: BookmarkIcon,
        iconColor: "text-emerald-500",
        title: "Add your own notes",
        description:
          "Every entry has a rich text editor for your own notes, highlights, and thoughts. Use it to annotate what you captured and why.",
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
        icon: TriangleAlertIcon,
        iconColor: "text-amber-500",
        title: "Call out what matters",
        description:
          "Type /alert in the editor for a coloured callout — note, tip, important, warning or caution. Exported Markdown writes them the way GitHub does, so they still read as callouts in GitHub, Obsidian and anywhere else that understands them.",
      },
      {
        icon: WrapTextIcon,
        iconColor: "text-indigo-500",
        title: "New line in the same block",
        description:
          "Press Shift+Enter in the editor to start a new line without creating a new block, so the lines stay part of the same paragraph, list item or heading.",
      },
      {
        icon: MousePointerClickIcon,
        iconColor: "text-pink-500",
        title: "Right-click to select a block",
        description:
          "Right-click the drag handle next to a block to select all of its content and bring up the formatting toolbar. A regular click still opens the block menu.",
      },
    ],
  },
  {
    id: "library",
    title: "Library",
    summary: "Organizing and finding what you saved",
    icon: LibraryBigIcon,
    iconColor: "text-blue-500",
    tips: [
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
        icon: GlobeIcon,
        iconColor: "text-blue-500",
        title: "Everything from this site",
        description:
          "The home page shows what you already have from the site you are on. The link beside that group opens the Library filtered to it, however many there are.",
      },
      {
        icon: KeyboardIcon,
        iconColor: "text-slate-500",
        title: "Keys for the things you do often",
        description:
          "With the side panel focused: n for a new entry, Shift+N for a new topic, e to edit what is open, / to search, and ? for the full list.",
      },
    ],
  },
];

export function findTipCategory(id: string | undefined): TipCategory | null {
  return TIP_CATEGORIES.find((category) => category.id === id) ?? null;
}
