import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
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

import { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import {
  ArchiveIcon,
  MinusIcon,
  PinIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRxCollection } from "rxdb/plugins/react";

export interface TopicItemProps {
  topic: TopicDocType;
  topUIScrollOffset?: number;
}

type InteractionEvent =
  | React.MouseEvent<HTMLDivElement>
  | React.KeyboardEvent<HTMLDivElement>;

export function TopicItem({ topic, topUIScrollOffset }: TopicItemProps) {
  const navigate = useNavigate();
  const formattedDate = formatDate(topic.updatedAt);
  const collection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");

  const handleAttributeToggle = async (
    e: InteractionEvent,
    attribute: "isFavorite" | "isPinned" | "isArchived",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (collection) {
      const doc = await collection
        .findOne({ selector: { id: topic.id } })
        .exec();
      if (doc) {
        const newValue = !topic[attribute];
        const patch: Partial<
          Pick<TopicDocType, "isFavorite" | "isPinned" | "isArchived">
        > = { [attribute]: newValue };

        if (attribute === "isArchived" && entriesCollection) {
          // Bulk-archive or restore entries that aren't explicitly archived by the user.
          const implicitEntries = await entriesCollection
            .find({
              selector: {
                topicId: topic.id,
                archivedExplicitly: false,
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
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!collection) return;

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
  };

  const handleNavigate = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    // Save scroll position as a plain number before navigating away
    const adjustedScrollTop = window.scrollY - (topUIScrollOffset ?? 0);
    sessionStorage.setItem("topicListScrollTop", adjustedScrollTop.toString());

    navigate(`/library/topics/${topic.id}`, { viewTransition: true });
  };

  const stopPropagation = (e: InteractionEvent) => e.stopPropagation();

  return (
    <Item
      key={topic.id}
      variant="default"
      className={cn(
        "button-default cursor-pointer duration-150 ease-out",
        "h-full /*min-h-26.25*/ flex-col items-start py-2.75 px-3.25 rounded-2xl",
        !topic.tags?.length && "pb-2.5",
        "bg-card hover:bg-card-hover not-dark:shadow-xs",
      )}
      asChild
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleNavigate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleNavigate(e);
        }}
      >
        <div className="flex w-full justify-between items-start gap-3.5">
          <ItemContent
            className={cn(
              "flex-1 min-w-0 flex-col justify-between items-start gap-2",
              !topic.tags?.length && "gap-2.25",
            )}
          >
            <ItemTitle className="line-clamp-1 truncate max-w-full">
              {topic.name}
            </ItemTitle>
            <ItemDescription className="line-clamp-2 mt-px truncate max-w-[min(100%,600px)]">
              {topic.description || <MinusIcon className="inline size-2.5" />}
            </ItemDescription>
          </ItemContent>
          <ItemContent
            className={cn(
              "flex-none flex-col justify-between items-end gap-3.25 mt-0.5",
              !topic.tags?.length && "gap-3.75",
            )}
          >
            <div className="flex justify-end items-center gap-2.5">
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "group size-6 min-w-6 flex justify-end p-1 -m-1 cursor-pointer rounded-md transition-colors hover:bg-foreground/10 dark:hover:bg-foreground/12",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-500 dark:focus-visible:ring-offset-gray-400 focus-visible:ring-gray-500/50",
                )}
                onClick={(e) => handleAttributeToggle(e, "isArchived")}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleAttributeToggle(e, "isArchived");
                }}
              >
                <ArchiveIcon
                  className={cn(
                    "size-4 transition-colors",
                    topic.isArchived
                      ? "text-green-600"
                      : "text-gray-400/75 dark:text-gray-600 group-hover:text-gray-500/75 dark:group-hover:text-gray-400",
                  )}
                />
              </div>
              {topic.isArchived && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div
                      id={"delete-button-" + topic.id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "group size-6 min-w-6 flex justify-end p-1 -m-1 cursor-pointer rounded-md transition-colors hover:bg-destructive/20 dark:hover:bg-destructive/40",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-red-500 dark:focus-visible:ring-offset-red-400 focus-visible:ring-red-500/50",
                      )}
                      onClick={stopPropagation}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          document
                            .getElementById("delete-button-" + topic.id)
                            ?.click();
                        }
                      }}
                    >
                      <Trash2Icon className="size-4 text-gray-400/75 dark:text-gray-600 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors" />
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    size="sm"
                    className="z-200! select-none p-4"
                    onClick={stopPropagation}
                    onKeyDown={stopPropagation}
                  >
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
                        along with all its entries and their content. This
                        action cannot be undone.
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
              )}
              {!topic.isArchived && (
                <>
                  <div
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "group size-6 min-w-6 flex justify-end p-1 -m-1 cursor-pointer rounded-md transition-colors hover:bg-foreground/10 dark:hover:bg-foreground/12",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-500 dark:focus-visible:ring-offset-gray-400 focus-visible:ring-gray-500/50",
                    )}
                    onClick={async (e) => handleAttributeToggle(e, "isPinned")}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleAttributeToggle(e, "isPinned");
                    }}
                  >
                    <PinIcon
                      className={cn(
                        "size-4",
                        topic.isPinned
                          ? "text-blue-600 fill-blue-600 dark:text-blue-500 dark:fill-blue-500"
                          : "text-gray-500/75 dark:text-gray-400",
                      )}
                    />
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "size-6 min-w-6 flex justify-end p-1 -m-1 cursor-pointer rounded-md transition-colors hover:bg-foreground/10 dark:hover:bg-foreground/12",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-500 dark:focus-visible:ring-offset-gray-400 focus-visible:ring-gray-500/50",
                    )}
                    onClick={async (e) =>
                      handleAttributeToggle(e, "isFavorite")
                    }
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleAttributeToggle(e, "isFavorite");
                    }}
                  >
                    <StarIcon
                      className={cn(
                        "size-4",
                        topic.isFavorite
                          ? "text-yellow-600 fill-yellow-600 dark:text-yellow-500 dark:fill-yellow-500"
                          : "text-gray-500/75 dark:text-gray-400",
                      )}
                    />
                  </div>
                </>
              )}
            </div>
            <ItemDescription className="text-xs text-muted-foreground whitespace-nowrap">
              {formattedDate}
            </ItemDescription>
          </ItemContent>
        </div>
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 w-[90%] mt-0 h-5.5 overflow-hidden content-start">
            {topic.tags.map((tag, index) => (
              <span
                key={topic.id + "-tag-" + index}
                className="px-1.5 py-0.5 rounded-md bg-gray-400/25 dark:bg-gray-600/40 text-[11px] font-medium text-lc-muted-foreground-hover truncate max-w-30 min-w-0 shrink-0"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Item>
  );
}
