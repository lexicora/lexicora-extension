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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EntryItem } from "@/components/entry-list";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { TopicDocType } from "@/db/schemas/topic";
import { EntryDocType } from "@/db/schemas/entry";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import {
  ArchiveIcon,
  ChevronRightIcon,
  ClipboardIcon,
  LayoutListIcon,
  PinIcon,
  PlusIcon,
  SquarePenIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRxCollection } from "rxdb/plugins/react";

function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const collection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");

  // undefined = still loading, null = not found, otherwise the topic.
  const [topic, setTopic] = useState<TopicDocType | null | undefined>(
    undefined,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [favoriteEntries, setFavoriteEntries] = useState<EntryDocType[]>([]);
  const [entriesCount, setEntriesCount] = useState<number>(0);

  useEffect(() => {
    if (!collection || !id) return;

    const sub = collection.findOne({ selector: { id } }).$.subscribe({
      next: (doc) => setTopic(doc ? (doc.toJSON() as TopicDocType) : null),
      error: (err) => {
        console.error("Error loading topic:", err);
        setTopic(null);
      },
    });

    return () => sub.unsubscribe();
  }, [collection, id]);

  useEffect(() => {
    if (!entriesCollection || !id) return;

    const sub = entriesCollection
      .find({
        selector: { topicId: id, isFavorite: true, isArchived: { $ne: true } },
        sort: [{ updatedAt: "desc" }],
      })
      .$.subscribe({
        next: (docs) => setFavoriteEntries(docs as EntryDocType[]),
        error: (err) => {
          console.error("Error loading favorite entries:", err);
          setFavoriteEntries([]);
        },
      });

    return () => sub.unsubscribe();
  }, [entriesCollection, id]);

  useEffect(() => {
    if (!entriesCollection || !id) return;
    const sub = entriesCollection
      .count({ selector: { topicId: id, isArchived: false } })
      .$.subscribe({
        next: setEntriesCount,
        error: () => setEntriesCount(0),
      });
    return () => sub.unsubscribe();
  }, [entriesCollection, id]);

  const handleAttributeToggle = async (
    attribute: "isFavorite" | "isArchived" | "isPinned",
  ) => {
    if (!collection || !topic) return;

    const doc = await collection.findOne({ selector: { id: topic.id } }).exec();
    if (!doc) return;

    const newValue = !topic[attribute];
    const patch: any = { [attribute]: newValue };

    if (attribute === "isArchived" && entriesCollection) {
      const implicitEntries = await entriesCollection
        .find({
          selector: { topicId: topic.id, archivedExplicitly: { $ne: true } },
        })
        .exec();
      await Promise.all(
        implicitEntries.map((e) =>
          e.incrementalPatch({ isArchived: newValue }),
        ),
      );
    }

    await doc.incrementalPatch(patch);
  };

  const handleCopyMarkdown = async () => {
    if (!topic) return;
    try {
      const lines: string[] = [];
      lines.push("**Topic**", "");
      lines.push(`# ${topic.name}`, "");
      if (topic.description) lines.push(topic.description, "");
      if (topic.tags && topic.tags.length > 0)
        lines.push(`**Tags:** ${topic.tags.join(", ")}`, "");
      lines.push(
        `**Entries:** ${entriesCount} | **Created:** ${formatDate(topic.createdAt)} | **Updated:** ${formatDate(topic.updatedAt)}`,
        "",
      );
      // TODO: Include topic entries in the copy output when implemented
      await navigator.clipboard.writeText(lines.join("\n").trimEnd());
    } catch (e) {
      console.error("Failed to copy topic as Markdown:", e);
    }
  };

  const handleDelete = async () => {
    if (!collection || !topic) return;

    const doc = await collection.findOne({ selector: { id: topic.id } }).exec();
    if (!doc) return;

    const entries = await entriesCollection
      ?.find({ selector: { topicId: topic.id } })
      .exec();
    for (const entry of entries ?? []) {
      const blocks = await blocksCollection
        ?.find({ selector: { entryId: entry.id } })
        .exec();
      if (blocks) await Promise.all(blocks.map((b) => b.remove()));
      await entry.remove();
    }
    await doc.remove();

    navigate("/library", { replace: true, viewTransition: true });
  };

  if (topic === undefined) {
    return (
      <PageContainer id="lc-topic-detail-page">
        <PageHeader title="Topic" goBackButton />
      </PageContainer>
    );
  }

  if (topic === null) {
    return (
      <PageContainer id="lc-topic-detail-page">
        <PageHeader title="Topic" goBackButton />
        <main className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="text-muted-foreground">
            This topic could not be found.
          </p>
        </main>
      </PageContainer>
    );
  }

  const viewEntriesButton = {
    iconSmall: <LayoutListIcon className="size-4.5" />,
    iconLarge: <LayoutListIcon className="size-5.5" />,
    variant: "default" as const,
    onClick: () =>
      navigate(`/library/topics/${topic.id}/entries`, { viewTransition: true }),
    title: "View entries",
    type: "button" as const,
  };

  return (
    <PageContainer id="lc-topic-detail-page">
      <PageHeader
        title="Topic"
        classNameHeaderElement="mb-3"
        goBackButton
        goBackButtonVariant="tinted"
        rightActionButton={viewEntriesButton}
      />

      <section className="px-1 mx-auto w-full text-left select-text">
        {/* Title */}
        <h1 className="text-2xl font-semibold leading-tight wrap-break-word text-pretty">
          {topic.name}
        </h1>

        {/* Description */}
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-pretty mt-4",
            !topic.description && "italic text-muted-foreground select-none",
          )}
        >
          {topic.description || "No description."}
        </p>

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            {topic.tags.map((tag, index) => (
              <Badge
                key={topic.id + "-tag-" + index}
                variant="secondary"
                className="max-w-40 truncate text-muted-foreground-hover"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="flex flex-wrap max-w-lg justify-between gap-x-6 gap-y-1 mt-5 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-lc-muted-foreground-hover">
              Created
            </span>{" "}
            {formatDate(topic.createdAt)}
          </span>
          <span>
            <span className="font-medium text-lc-muted-foreground-hover">
              Updated
            </span>{" "}
            {formatDate(topic.updatedAt)}
          </span>
        </div>

        {/* Action bar: state toggles + edit + delete */}
        <Separator className="mx-auto max-w-[calc(100%-8px)] mt-4 opacity-60" />
        <div className="flex items-center gap-1 mt-0 pt-2">
          <Button
            variant="ghost"
            size="icon"
            title={
              topic.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            onClick={() => handleAttributeToggle("isFavorite")}
            className={cn(
              "size-9 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800",
              topic.isArchived && "opacity-40 pointer-events-none",
            )}
          >
            <StarIcon
              className={cn(
                "size-4.5",
                topic.isFavorite
                  ? "text-yellow-600 fill-yellow-600 dark:text-yellow-500 dark:fill-yellow-500"
                  : "text-muted-foreground",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={topic.isPinned ? "Unpin topic" : "Pin topic"}
            onClick={() => handleAttributeToggle("isPinned")}
            className={cn(
              "size-9 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800",
              topic.isArchived && "opacity-40 pointer-events-none",
            )}
          >
            <PinIcon
              className={cn(
                "size-4.5",
                topic.isPinned
                  ? "text-blue-600 fill-blue-600 dark:text-blue-500 dark:fill-blue-500"
                  : "text-muted-foreground",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={topic.isArchived ? "Restore topic" : "Archive topic"}
            onClick={() => handleAttributeToggle("isArchived")}
            className="size-9 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <ArchiveIcon
              className={cn(
                "size-4.5",
                topic.isArchived ? "text-green-600" : "text-muted-foreground",
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Copy topic as Markdown"
            onClick={handleCopyMarkdown}
            className="ml-auto size-9 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 text-muted-foreground"
          >
            <ClipboardIcon className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Edit topic"
            onClick={() =>
              navigate(`/library/topics/${topic.id}/edit`, {
                viewTransition: true,
              })
            }
            className="size-9 rounded-lg text-muted-foreground hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-950/50 dark:hover:text-green-400"
          >
            <SquarePenIcon className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete topic"
            onClick={() => setDeleteOpen(true)}
            className="size-9 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          >
            <Trash2Icon className="size-4.5" />
          </Button>
        </div>
      </section>

      {/* Favorite entries preview */}
      {favoriteEntries.length > 0 && (
        <section className="px-0.75 mx-auto w-full mt-2 mb-2.25">
          <Separator className="mx-auto max-w-[calc(100%-8px)] mt-0 mb-3 opacity-60" />
          <div className="flex items-center gap-1.5 mb-2 px-1.25">
            <StarIcon className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">
              Favorites
            </span>
            <button
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-lc-muted-foreground-hover hover:underline underline-offset-2 transition-colors cursor-pointer"
              onClick={() =>
                navigate(`/library/topics/${topic.id}/entries`, {
                  viewTransition: true,
                })
              }
            >
              {/* <ListIcon className="size-3.5 shrink-0" /> */}
              <span className="font-normal">Total {entriesCount}</span>
              <ChevronRightIcon className="size-3.5 shrink-0 opacity-70" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {favoriteEntries.map((entry) => (
              <EntryItem key={entry.id} entry={entry} disableScrollRestore />
            ))}
          </div>
        </section>
      )}

      {/* Floating create entry button — hidden for archived topics */}
      {!topic.isArchived && (
        <div className="fixed bottom-17.75 left-0 w-full px-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-20 pointer-events-none">
          <div className="shrink-0 flex items-center justify-end max-w-315 mx-auto inset-x-0">
            <Button
              size="icon"
              title="Create Entry"
              draggable={false}
              className={cn(
                "pointer-events-auto",
                "text-lc-light-foreground bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800",
                "ring-1 ring-inset ring-black/20 dark:ring-white/30 hover:ring-black/25 dark:hover:ring-white/25",
                "size-9 rounded-[12px] shadow-[0px_0px_6px_3px_rgba(0,0,0,0.1)]",
                "focus-visible:ring-offset-1",
              )}
              onClick={() =>
                navigate(
                  `/library/entries/new?topicId=${encodeURIComponent(topic.id)}`,
                  { viewTransition: true },
                )
              }
            >
              <PlusIcon className="size-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm" className="select-none p-4">
          <AlertDialogHeader>
            <AlertDialogMedia className="size-12 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon className="size-6" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete topic?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="text-lc-muted-foreground-hover">
                "{topic.name}"
              </span>{" "}
              along with all its entries and their content. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3.5">
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
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

export default TopicDetailPage;
