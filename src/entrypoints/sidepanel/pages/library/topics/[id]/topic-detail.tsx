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
import { EntryList } from "@/components/entry-list";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import {
  ArchiveIcon,
  SquarePenIcon,
  StarIcon,
  Trash2Icon,
  PinIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRxCollection } from "rxdb/plugins/react";
import { Separator } from "@/components/ui/separator";

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
      <PageHeader
        title="Topic"
        classNameHeaderElement="mb-6"
        goBackButton
        rightActionButton={editButton}
      />

      <section className="px-1 /*max-w-2xl*/ mx-auto w-full text-left">
        {/* Title */}
        <h1 className="text-2xl font-semibold leading-tight break-words text-pretty">
          {topic.name}
        </h1>

        {/* Description */}
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-pretty mt-4",
            !topic.description && "italic text-muted-foreground",
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
                className="max-w-40 truncate text-muted-foreground"
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

        {/* Action bar: state toggles + delete */}
        <Separator className="mx-1 max-w-[calc(100%-8px)] mt-4 opacity-60" />
        <div className="flex items-center gap-1 mt-0 pt-2">
          <Button
            variant="ghost"
            size="icon"
            title={
              topic.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            onClick={() => handleAttributeToggle("isFavorite")}
            className="size-9 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <StarIcon
              className={cn(
                "size-4.5",
                topic.isFavorite
                  ? "text-yellow-600/80 fill-yellow-600/85 dark:text-yellow-500 dark:fill-yellow-500"
                  : "text-muted-foreground",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={topic.isPinned ? "Unpin topic" : "Pin topic"}
            onClick={() => handleAttributeToggle("isPinned")}
            className="size-9 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <PinIcon
              className={cn(
                "size-4.5",
                topic.isPinned
                  ? "text-blue-600/80 fill-blue-600/85 dark:text-blue-500 dark:fill-blue-500"
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
                topic.isArchived
                  ? "text-green-600/80 dark:text-green-600"
                  : "text-muted-foreground",
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Delete topic"
            onClick={() => setDeleteOpen(true)}
            className="ml-auto size-9 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          >
            <Trash2Icon className="size-4.5" />
          </Button>
        </div>
      </section>

      {/* Entries belonging to this topic (potentially add ref, for top UI scroll offset )*/}
      <main className="mb-0 mt-px">
        <EntryList topicId={topic.id} topUIScrollOffset={375} search="" />
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
