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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EntryList } from "@/components/entry-list";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import { ArchiveIcon, SquarePenIcon, StarIcon, Trash2Icon } from "lucide-react";
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
  const [topic, setTopic] = useState<TopicDocType | null | undefined>(undefined);

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
    attribute: "isFavorite" | "isArchived",
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
          <p className="text-muted-foreground">This topic could not be found.</p>
        </main>
      </PageContainer>
    );
  }

  const editButton = {
    iconSmall: <SquarePenIcon className="size-4.5" />,
    iconLarge: <SquarePenIcon className="size-5.5" />,
    variant: "default" as const,
    onClick: () => navigate(`/library/topics/${topic.id}/edit`),
    title: "Edit Topic",
    type: "button" as const,
  };

  return (
    <PageContainer id="lc-topic-detail-page">
      <PageHeader
        title={topic.name}
        goBackButton
        rightActionButton={editButton}
      />

      <section className="px-0.5 max-w-2xl mx-auto w-full">
        {/* Description */}
        <p
          className={cn(
            "text-sm whitespace-pre-wrap break-words",
            !topic.description && "italic text-muted-foreground",
          )}
        >
          {topic.description || "No description."}
        </p>

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
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
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-3 text-xs text-muted-foreground">
          <span>Created {formatDate(topic.createdAt)}</span>
          <span>Updated {formatDate(topic.updatedAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 mb-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAttributeToggle("isFavorite")}
            title={
              topic.isFavorite ? "Remove from favorites" : "Mark as favorite"
            }
          >
            <StarIcon
              className={cn(
                "size-4",
                topic.isFavorite
                  ? "text-yellow-600/70 fill-yellow-600/85 dark:text-yellow-500 dark:fill-yellow-500"
                  : "text-muted-foreground",
              )}
            />
            {topic.isFavorite ? "Favorited" : "Favorite"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAttributeToggle("isArchived")}
            title={topic.isArchived ? "Restore topic" : "Archive topic"}
          >
            <ArchiveIcon
              className={cn(
                "size-4",
                topic.isArchived
                  ? "text-green-500/80 dark:text-green-600"
                  : "text-muted-foreground",
              )}
            />
            {topic.isArchived ? "Archived" : "Archive"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto text-muted-foreground hover:text-red-500 hover:border-red-300 dark:hover:border-red-900"
                title="Delete topic"
              >
                <Trash2Icon className="size-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
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
                  along with all its entries and their content. This action
                  cannot be undone.
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
        </div>
      </section>

      {/* Entries belonging to this topic */}
      <main className="mb-0 mt-2">
        <EntryList topicId={topic.id} search="" />
      </main>
    </PageContainer>
  );
}

export default TopicDetailPage;
