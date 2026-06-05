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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EntryItem, EntryList } from "@/components/entry-list";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { TopicDocType } from "@/db/schemas/topic";
import { EntryDocType } from "@/db/schemas/entry";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import {
  ArchiveIcon,
  ArrowLeftRightIcon,
  PinIcon,
  SearchIcon,
  SquarePenIcon,
  StarIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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

  const [searchParams, setSearchParams] = useSearchParams();
  // Navigating here from an entry's "parent topic" link passes
  // ?hideEntries=true, which suppresses every entry-list display so a
  // topic → entry → topic → entry navigation loop can't form.
  const hideEntries = searchParams.get("hideEntries") === "true";
  const tab: "overview" | "entries" =
    !hideEntries && searchParams.get("tab") === "entries"
      ? "entries"
      : "overview";

  const setTab = (next: "overview" | "entries") => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next === "entries") params.set("tab", "entries");
        else params.delete("tab");
        return params;
      },
      { replace: true, viewTransition: true },
    );
  };

  // Favorite entries of this topic, shown as a preview on the Overview tab.
  const [favoriteEntries, setFavoriteEntries] = useState<EntryDocType[]>([]);

  // Entries-tab search + filters (mirrors the Library page behaviour).
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const filter = {
    onlyFavorites: showFavorites,
    onlyArchived: showArchived,
  } as const;

  const handleToggleFilter = (
    type: "favorites" | "archived",
    pressed: boolean,
  ) => {
    if (type === "favorites") {
      setShowFavorites(pressed);
      if (pressed) setShowArchived(false);
    } else {
      setShowArchived(pressed);
      if (pressed) setShowFavorites(false);
    }
  };

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

    navigate("/library", { replace: true, viewTransition: true });
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

  // Top-right header action: the prominent content/overview switch.
  const tabToggleButton = {
    iconSmall: <ArrowLeftRightIcon className="size-4.5" />,
    iconLarge: <ArrowLeftRightIcon className="size-5.5" />,
    variant: "default" as const,
    onClick: () => setTab(tab === "overview" ? "entries" : "overview"),
    title: tab === "overview" ? "View entries" : "View overview",
    type: "button" as const,
  };

  return (
    <PageContainer id="lc-topic-detail-page">
      <Tabs value={tab}>
        <PageHeader
          title="Topic"
          classNameHeaderElement="mb-3"
          goBackButton
          rightActionButton={hideEntries ? undefined : tabToggleButton}
        />

        {/* ── Overview ───────────────────────────────────────────────── */}
        <TabsContent value="overview">
          <section className="px-1 mx-auto w-full text-left">
            {/* Title */}
            <h1 className="text-2xl font-semibold leading-tight wrap-break-word text-pretty">
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

            {/* Action bar: state toggles + delete */}
            <Separator className="mx-auto max-w-[calc(100%-8px)] mt-4 opacity-60" />
            <div className="flex items-center gap-1 mt-0 pt-2">
              <Button
                variant="ghost"
                size="icon"
                title={
                  topic.isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
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
                title="Edit topic"
                onClick={() =>
                  navigate(`/library/topics/${topic.id}/edit`, {
                    viewTransition: true,
                  })
                }
                className="ml-auto size-9 rounded-lg text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-800"
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
          {!hideEntries && favoriteEntries.length > 0 && (
            <section className="px-1 mx-auto w-full mt-2">
              <Separator className="mx-auto max-w-[calc(100%-8px)] mt-0 mb-3 opacity-60" />
              <div className="flex /*justify-center*/ items-center gap-1.5 mb-1.5 px-1.25">
                <StarIcon className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground tracking-wide">
                  Favorites
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {favoriteEntries.map((entry) => (
                  <EntryItem
                    key={entry.id}
                    entry={entry}
                    scrollStorageKey={`favoritePreview:${topic.id}`}
                  />
                ))}
              </div>
            </section>
          )}
        </TabsContent>

        {/* ── Entries ────────────────────────────────────────────────── */}
        {!hideEntries && (
          <TabsContent value="entries">
            <div className="flex items-center gap-1.5 px-1.5 pt-0.5 pb-1.5 dark:scheme-dark">
              <div className="flex-1">
                <Field orientation="horizontal">
                  <InputGroup>
                    <InputGroupAddon>
                      <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      name="search"
                      placeholder="Search entries..."
                      className="h-8 px-2"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <InputGroupButton
                        size="icon-sm"
                        onClick={() => setSearch("")}
                        title="Clear search"
                        className="size-7.5 mr-0.5"
                      >
                        <XIcon />
                      </InputGroupButton>
                    )}
                  </InputGroup>
                </Field>
              </div>
              <div className="flex items-center gap-0">
                <Toggle
                  title={showFavorites ? "Show all" : "Show only Favorites"}
                  variant="outline"
                  className="shrink-0 transition-colors min-w-9 size-9 rounded-r-none border-r-border/50"
                  pressed={showFavorites}
                  onPressedChange={(pressed) =>
                    handleToggleFilter("favorites", pressed)
                  }
                >
                  <StarIcon className="group-data-[state=on]/toggle:text-yellow-500 group-data-[state=on]/toggle:fill-yellow-500" />
                </Toggle>
                <Toggle
                  title={showArchived ? "Show all" : "Show only Archived"}
                  variant="outline"
                  className="shrink-0 transition-colors min-w-9 size-9 rounded-l-none -ml-px not-data-[state=on]:border-l-border/90"
                  pressed={showArchived}
                  onPressedChange={(pressed) =>
                    handleToggleFilter("archived", pressed)
                  }
                >
                  <ArchiveIcon className="group-data-[state=on]/toggle:text-green-600 dark:group-data-[state=on]/toggle:text-green-500" />
                </Toggle>
              </div>
            </div>

            <main className="mb-0 mt-px">
              <EntryList
                topicId={topic.id}
                search={deferredSearch}
                filter={filter}
                scrollStorageKey={`entryList:${topic.id}`}
                topUIScrollOffset={194}
              />
            </main>
          </TabsContent>
        )}
      </Tabs>

      {/* Delete confirmation (controlled so it survives the menu closing) */}
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
