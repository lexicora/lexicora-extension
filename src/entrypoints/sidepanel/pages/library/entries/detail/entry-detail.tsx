import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { appBlockNoteConfig } from "@/components/editor/config";
import { BlockNoteView } from "@/components/editor/BlockNoteView";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { EntryDocType } from "@/db/schemas/entry";
import { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import { useEntryDetail } from "./__hooks__/use-entry-detail";
import {
  ArchiveIcon,
  ChevronRightIcon,
  ClipboardIcon,
  EllipsisIcon,
  FileTextIcon,
  PinIcon,
  SquarePenIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useCreateBlockNote } from "@blocknote/react";
import { Avatar } from "radix-ui";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRxCollection } from "rxdb/plugins/react";

type CopyableEditor = {
  blocksToMarkdownLossy(blocks?: any[]): Promise<string>;
  blocksToHTMLLossy(blocks?: any[]): Promise<string>;
  document: any[];
};

function EntryContentViewer({
  initialBlocks,
  onEditorReady,
}: {
  initialBlocks: any[];
  onEditorReady?: (editor: CopyableEditor) => void;
}) {
  const editor = useCreateBlockNote({
    ...appBlockNoteConfig,
    initialContent: initialBlocks.length > 0 ? initialBlocks : undefined,
  });

  useEffect(() => {
    onEditorReady?.(editor as unknown as CopyableEditor);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BlockNoteView
      editor={editor}
      editable={false}
      className="text-left select-text"
      id="lc-blocknote-view-entry-detail"
    />
  );
}

function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");

  const { entry, topic, blocks } = useEntryDetail(id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const editorRef = useRef<CopyableEditor | null>(null);

  const handleAttributeToggle = async (
    attribute: "isFavorite" | "isPinned" | "isArchived",
  ) => {
    if (!entriesCollection || !entry) return;
    const doc = await entriesCollection
      .findOne({ selector: { id: entry.id } })
      .exec();
    if (!doc) return;
    const newValue = !entry[attribute];
    const patch: any = { [attribute]: newValue };
    if (attribute === "isArchived") {
      patch.archivedExplicitly = newValue;
    }
    await doc.incrementalPatch(patch);
  };

  const handleCopyContentMarkdown = async () => {
    if (!editorRef.current) return;
    try {
      const md = await editorRef.current.blocksToMarkdownLossy(
        editorRef.current.document,
      );
      await navigator.clipboard.writeText(md);
    } catch (e) {
      console.error("Failed to copy as Markdown:", e);
    }
  };

  const handleCopyEntryMarkdown = async (entry: EntryDocType) => {
    try {
      const lines: string[] = [];
      lines.push("**Entry**", "");
      lines.push(`# ${entry.title}`, "");
      if (topic) {
        lines.push(`**Topic:** ${topic.name}`, "");
      }
      if (entry.url) {
        const label = entry.siteName || entry.hostnameUrl || entry.url;
        lines.push(`**Source:** [${label}](${entry.url})`, "");
      } else if (entry.siteName) {
        lines.push(`**Source:** ${entry.siteName}`, "");
      }
      if (entry.description) {
        lines.push(entry.description, "");
      }
      if (entry.tags && entry.tags.length > 0) {
        lines.push(`**Tags:** ${entry.tags.join(", ")}`, "");
      }
      lines.push(
        `**Created:** ${formatDate(entry.createdAt)} | **Updated:** ${formatDate(entry.updatedAt)}`,
        "",
      );
      if (editorRef.current) {
        const contentMd = await editorRef.current.blocksToMarkdownLossy(
          editorRef.current.document,
        );
        if (contentMd.trim()) {
          lines.push("---", "", contentMd);
        }
      }
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (e) {
      console.error("Failed to copy entry as Markdown:", e);
    }
  };

  const handleDelete = async () => {
    if (!entriesCollection || !entry) return;
    const doc = await entriesCollection
      .findOne({ selector: { id: entry.id } })
      .exec();
    if (!doc) return;
    const existingBlocks = await blocksCollection
      ?.find({ selector: { entryId: entry.id } })
      .exec();
    if (existingBlocks)
      await Promise.all(existingBlocks.map((b) => b.remove()));
    await doc.remove();
    navigate(-1);
  };

  if (entry === undefined) {
    return (
      <PageContainer id="lc-entry-detail-page">
        <PageHeader title="Entry" goBackButton />
      </PageContainer>
    );
  }

  if (entry === null) {
    return (
      <PageContainer id="lc-entry-detail-page">
        <PageHeader title="Entry" goBackButton />
        <main className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="text-muted-foreground">
            This entry could not be found.
          </p>
        </main>
      </PageContainer>
    );
  }

  type BlockLike = { type?: string; content?: unknown[]; children?: unknown[] };
  const blocksList = blocks as BlockLike[] | null;
  const hasContent =
    !!blocksList &&
    !(
      blocksList.length === 0 ||
      (blocksList.length === 1 &&
        blocksList[0].type === "paragraph" &&
        (!blocksList[0].content || blocksList[0].content.length === 0) &&
        (!blocksList[0].children || blocksList[0].children.length === 0))
    );

  return (
    <PageContainer id="lc-entry-detail-page">
      <PageHeader
        title="Entry"
        classNameHeaderElement="mb-3"
        goBackButton
        heavyTeardown
      />

      <section className="px-1 mx-auto w-full max-w-(--lc-content-max-width) text-left select-text">
        {/* Title */}
        {topic && (
          <button
            className="flex items-center gap-0.5 ml-px mb-1 max-w-full text-xs font-medium text-muted-foreground hover:text-lc-muted-foreground-hover hover:underline underline-offset-2 transition-colors cursor-pointer"
            onClick={() =>
              navigate(`/library/topics/${topic.id}`, {
                viewTransition: true,
              })
            }
          >
            <span className="truncate max-w-50">{topic.name}</span>
            <ChevronRightIcon className="size-3 shrink-0 opacity-70" />
          </button>
        )}
        <h1 className="text-2xl font-semibold leading-tight wrap-break-word text-pretty">
          {entry.title}
        </h1>

        {/* Source line: favicon + site name / hostname + subtle path.
            faviconUrl and siteName are independent metadata (not derived from url).
            hostnameUrl / pathnameUrl / searchUrl are derived from url and only exist when url is set. */}
        {(entry.faviconUrl || entry.siteName || entry.url) && (
          <div className="flex items-center gap-1.5 mt-3 min-w-0">
            {entry.faviconUrl && (
              <Avatar.Root className="size-4.5 rounded-sm opacity-90 shrink-0 ml-0.5">
                <Avatar.Image
                  className="rounded-sm"
                  src={entry.faviconUrl}
                  alt="Favicon"
                />
                <Avatar.Fallback delayMs={50}>
                  <div className="bg-gray-400/35 dark:bg-gray-700/50 size-4.25 rounded-sm" />
                </Avatar.Fallback>
              </Avatar.Root>
            )}
            {(entry.siteName || entry.hostnameUrl) && (
              <div className="flex items-center mt-px min-w-0 gap-1">
                {entry.url ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={"Visit: " + entry.url}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate min-w-0"
                  >
                    {entry.siteName || entry.hostnameUrl}
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground truncate min-w-0">
                    {entry.siteName}
                  </span>
                )}
                {entry.pathnameUrl && entry.pathnameUrl !== "/" && (
                  <span className="text-xs mt-px text-muted-foreground/60 truncate">
                    {entry.pathnameUrl}
                    {entry.searchUrl || ""}
                  </span>
                )}
                {/* Visually hidden but included in clipboard when user selects and copies */}
                <span aria-hidden="true" className="sr-only select-text">
                  {entry.url}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-pretty mt-4",
            !entry.description && "italic text-muted-foreground select-none",
          )}
        >
          {entry.description || "No description."}
        </p>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            {entry.tags.map((tag, index) => (
              <Badge
                key={entry.id + "-tag-" + index}
                variant="secondary"
                className="max-w-40 truncate text-muted-foreground-hover"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 mt-5 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-lc-muted-foreground-hover">
              Created
            </span>{" "}
            {formatDate(entry.createdAt)}
          </span>
          <span>
            <span className="font-medium text-lc-muted-foreground-hover">
              Updated
            </span>{" "}
            {formatDate(entry.updatedAt)}
          </span>
        </div>

        {/* Action bar */}
        <Separator className="mx-auto max-w-[calc(100%-8px)] mt-4 opacity-60" />
        <div className="flex items-center gap-1 mt-0 pt-2">
          <Button
            variant="ghost"
            size="icon"
            title={
              entry.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            onClick={() => handleAttributeToggle("isFavorite")}
            className={cn(
              "size-9 rounded-lg hover:bg-gray-300/75 dark:hover:bg-gray-800",
              entry.isArchived && "opacity-40 pointer-events-none",
            )}
          >
            <StarIcon
              className={cn(
                "size-4.5",
                entry.isFavorite
                  ? "text-yellow-600 fill-yellow-600 dark:text-yellow-500 dark:fill-yellow-500"
                  : "text-muted-foreground",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={entry.isPinned ? "Unpin entry" : "Pin entry"}
            onClick={() => handleAttributeToggle("isPinned")}
            className={cn(
              "size-9 rounded-lg hover:bg-gray-300/75 dark:hover:bg-gray-800",
              entry.isArchived && "opacity-40 pointer-events-none",
            )}
          >
            <PinIcon
              className={cn(
                "size-4.5",
                entry.isPinned
                  ? "text-blue-600 fill-blue-600 dark:text-blue-500 dark:fill-blue-500"
                  : "text-muted-foreground",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={entry.isArchived ? "Restore entry" : "Archive entry"}
            onClick={() => handleAttributeToggle("isArchived")}
            className="size-9 rounded-lg hover:bg-gray-300/75 dark:hover:bg-gray-800"
          >
            <ArchiveIcon
              className={cn(
                "size-4.5",
                entry.isArchived ? "text-green-600" : "text-muted-foreground",
              )}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Copy actions"
                className={cn(
                  "ml-auto size-9 rounded-lg not-hover:text-muted-foreground",
                  "hover:bg-blue-200/80 hover:text-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-400",
                  "aria-expanded:bg-blue-200/80 aria-expanded:text-blue-700 dark:aria-expanded:bg-blue-900/50 dark:aria-expanded:text-blue-400",
                )}
              >
                <EllipsisIcon className="size-4.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="left" className="w-39">
              <DropdownMenuLabel className="text-xs font-medium select-none text-muted-foreground py-1">
                Copy content...
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                disabled={!hasContent}
                onClick={handleCopyContentMarkdown}
              >
                <FileTextIcon className="size-4 mr-2 text-blue-600 dark:text-blue-500" />
                As Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleCopyEntryMarkdown(entry)}
              >
                <ClipboardIcon className="size-4 mr-2 text-blue-600 dark:text-blue-500" />
                With metadata
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            title="Edit entry"
            onClick={() =>
              navigate(`/library/entries/${entry.id}/edit`, {
                viewTransition: true,
              })
            }
            className="size-9 rounded-lg text-muted-foreground hover:bg-green-200/80 hover:text-green-700 dark:hover:bg-green-900/50 dark:hover:text-green-400"
          >
            <SquarePenIcon className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete entry"
            onClick={() => setDeleteOpen(true)}
            className="size-9 rounded-lg text-muted-foreground hover:bg-red-200/80 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-400"
          >
            <Trash2Icon className="size-4.5" />
          </Button>
        </div>
      </section>

      {/* Rich content */}
      {blocks !== null && (
        <section className="mx-auto w-full /*max-w-[calc(var(--lc-content-max-width)+0.25rem)]*/ mt-2 mb-2">
          {/* <Separator className="mx-auto max-w-[calc(100%-8px)] mb-5 opacity-60" /> */}
          {hasContent ? (
            <EntryContentViewer
              initialBlocks={blocks!}
              onEditorReady={(editor) => {
                editorRef.current = editor;
              }}
            />
          ) : (
            <p className="italic text-muted-foreground text-sm px-4 py-3">
              No content.
            </p>
          )}
        </section>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm" className="select-none p-4">
          <AlertDialogHeader>
            <AlertDialogMedia className="size-12 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon className="size-6" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="text-lc-muted-foreground-hover">
                "{entry.title}"
              </span>{" "}
              and all its content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3.5">
            <AlertDialogCancel
              variant="outline"
              className="not-dark:bg-muted/15 not-dark:hover:bg-muted/50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="-mr-px"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

export default EntryDetailPage;
