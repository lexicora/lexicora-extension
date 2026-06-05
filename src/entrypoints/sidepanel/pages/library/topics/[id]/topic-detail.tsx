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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { EntryList } from "@/components/entry-list";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import {
  ArchiveIcon,
  EllipsisIcon,
  SquarePenIcon,
  StarIcon,
  Trash2Icon,
  PinIcon,
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

  const handleAttributeToggle = async (
    attribute: "isFavorite" | "isArchived" | "isPinned",
  ) => {
    if (!collection || !topic) return;

    const doc = await collection.findOne({ selector: { id: topic.id } }).exec();
    if (!doc) return;

    const newValue = !topic[attribute];
    const patch: any = { [attribute]: newValue };

    if (attribute === "isArchived" && entriesCollection) {
      // Bulk-archive or restore entries that aren't explicitly archived by the user.
      const implicitEntries = await entriesCollection
        .find({
          selector: {
            topicId: topic.id,
            archivedExplicitly: { $ne: true },
          },
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

  const handleDelete = async () => {
    if (!collection || !topic) return;

    const doc = await collection.findOne({ selector: { id: topic.id } }).exec();
    if (!doc) return;

    // Cascade: delete all blocks → entries → topic
    const entries = await entriesCollection
      ?.find({ selector: { topicId: topic.id } })
      .exec();
    for (const entry of entries ?? []) {
      const blocks = await blocksCollection
        ?.find({ selector: { entryId: entry.id } })
        .exec();
      if (blocks) {
        await Promise.all(blocks.map((b) => b.remove()));
      }
      await entry.remove();
    }
    await doc.remove();

    navigate("/library", { replace: true });
  };

  // Loading state — keep the shell so the back button stays available.
  if (topic === undefined) {
    return (
      <PageContainer id="lc-topic-detail-page">
        <PageHeader title="Topic" goBackButton />
      </PageContainer>
    );
  }

  // Not found (invalid id or the topic was deleted).
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

  const editButton = {
    iconSmall: <SquarePenIcon className="size-4.5" />,
    iconLarge: <SquarePenIcon className="size-5.5" />,
    variant: "default" as const,
    onClick: () =>
      navigate(`/library/topics/${topic.id}/edit`, { viewTransition: true }),
    title: "Edit Topic",
    type: "button" as const,
  };

  return (
    <PageContainer id="lc-topic-detail-page">
      <PageHeader title="Topic" goBackButton rightActionButton={editButton} />

      <section className="px-1 /*max-w-2xl*/ mx-auto w-full text-left">
        {/* Title row + actions menu */}
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold leading-tight break-words min-w-0">
            {topic.name}
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="More actions"
                className="shrink-0 -mr-1 -mt-0.5 size-9 rounded-lg text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <EllipsisIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="group"
                onSelect={(e) => {
                  e.preventDefault();
                  handleAttributeToggle("isFavorite");
                }}
              >
                <StarIcon
                  className={cn(
                    topic.isFavorite
                      ? "text-yellow-600/70 fill-yellow-600/85 dark:text-yellow-500 dark:fill-yellow-500 group-hover:fill-transparent!"
                      : "text-muted-foreground",
                  )}
                />
                {topic.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="group"
                onSelect={(e) => {
                  e.preventDefault();
                  handleAttributeToggle("isPinned");
                }}
              >
                <PinIcon
                  className={cn(
                    topic.isPinned
                      ? "text-blue-600/70 fill-blue-600/85 dark:text-blue-500 dark:fill-blue-500 group-hover:fill-transparent!"
                      : "text-muted-foreground",
                  )}
                />
                {topic.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleAttributeToggle("isArchived");
                }}
              >
                <ArchiveIcon
                  className={cn(
                    topic.isArchived
                      ? "text-green-500/80 dark:text-green-600"
                      : "text-muted-foreground",
                  )}
                />
                {topic.isArchived ? "Restore topic" : "Archive topic"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteOpen(true);
                }}
              >
                <Trash2Icon />
                Delete topic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap wrap-break-words mt-4",
            !topic.description && "italic text-muted-foreground",
          )}
        >
          {topic.description || "No description."}
        </p>

        {/* Status pills */}
        {(topic.isFavorite || topic.isArchived || topic.isPinned) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {topic.isFavorite && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-500/15 text-[11px] font-medium text-yellow-700 dark:text-yellow-500">
                <StarIcon className="size-3 fill-current" />
                Favorite
              </span>
            )}
            {topic.isPinned && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/15 text-[11px] font-medium text-blue-700 dark:text-blue-500">
                <PinIcon className="size-3" />
                Pinned
              </span>
            )}
            {topic.isArchived && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-500/15 text-[11px] font-medium text-green-700 dark:text-green-600">
                <ArchiveIcon className="size-3" />
                Archived
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            {topic.tags.map((tag, index) => (
              <span
                key={topic.id + "-tag-" + index}
                className="px-1.5 py-0.5 rounded-md bg-gray-400/37 dark:bg-gray-600/40 text-[11px] font-medium text-lc-muted-foreground-hover truncate max-w-40"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-5 text-xs text-muted-foreground">
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
      </section>

      {/* Entries belonging to this topic */}
      <main className="mb-0 mt-4">
        <EntryList topicId={topic.id} search="" />
      </main>

      {/* Delete confirmation (controlled so it survives the dropdown closing) */}
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
