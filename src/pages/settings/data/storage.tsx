import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Item,
  ItemMedia,
  ItemHeader,
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BrushCleaningIcon,
  HardDriveIcon,
  LocateIcon,
  Trash2Icon,
  WandIcon,
} from "lucide-react";
import { useRxCollection } from "rxdb/plugins/react";
import { toast } from "sonner";
import { cleanupNow } from "@/db/cleanup";
import { Label } from "@/components/ui/label";

/** Disables every action while one is running — the purge holds a write lock. */
type BusyAction = "cleanup" | "clear";

/**
 * The space the library takes up: reclaiming what deleted items still hold,
 * and deleting everything.
 *
 * Exporting lives on its own page, so these irreversible actions do not sit
 * next to one that is done routinely.
 */
function DataSettingsPage() {
  const [clearOpen, setClearOpen] = useState(false);
  const [busy, setBusy] = useState<BusyAction | null>(null);

  const topicsCollection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");

  const runExclusive = (action: BusyAction, work: () => Promise<void>) => {
    setBusy(action);
    return work().finally(() => setBusy(null));
  };

  const handleCleanup = () => {
    if (!topicsCollection || !entriesCollection || !blocksCollection) return;

    const p = async () => {
      //* Purges rows already flagged `_deleted` from IndexedDB. Live documents
      //* are never matched, so this cannot touch data the user can still see.
      await cleanupNow({
        topics: topicsCollection,
        entries: entriesCollection,
        blocks: blocksCollection,
      });
    };

    toast.promise(runExclusive("cleanup", p), {
      loading: "Cleaning up database...",
      success: "Database cleaned up",
      error: "Failed to clean up database",
    });
  };

  const handleClear = () => {
    if (!topicsCollection || !entriesCollection || !blocksCollection) return;

    const p = async () => {
      //* NOTE: `remove()` only soft-deletes (sets `_deleted: true`), so each
      //* collection is then cleaned up with a zero threshold to physically purge
      //* the documents from IndexedDB. Requires RxDBCleanupPlugin (see src/db).
      await Promise.all([
        topicsCollection.find().remove(),
        entriesCollection.find().remove(),
        blocksCollection.find().remove(),
      ]);

      await cleanupNow({
        topics: topicsCollection,
        entries: entriesCollection,
        blocks: blocksCollection,
      });
    };

    toast.promise(runExclusive("clear", p), {
      loading: "Clearing all data...",
      success: "All data cleared",
      error: "Failed to clear data",
    });
  };

  return (
    <PageContainer>
      <PageHeader title="Storage" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-1">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon">
                <HardDriveIcon className="size-8 text-amber-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                Manage the space Lexicora uses in your browser. Reclaim space
                from items you have already deleted, or clear all data (topics,
                entries, and notes) permanently.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>
        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <LocateIcon className="size-3.5 text-purple-400" /> Actions
          </Label>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-card hover:bg-card-hover! not-dark:shadow-xs rounded-2xl rounded-b-none hover:cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
            asChild
          >
            <button onClick={handleCleanup} disabled={busy !== null}>
              <ItemMedia variant="icon">
                <BrushCleaningIcon className="size-5 text-sky-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {busy === "cleanup" ? "Cleaning up..." : "Clean Up Database"}
                </ItemTitle>
              </ItemContent>
            </button>
          </Item>
          {/* <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
              Reclaim space still held by items you have already deleted. Your
              topics, entries, and notes are not affected.
            </p> */}
          <SettingsItemSeparator />
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-card hover:bg-card-hover! not-dark:shadow-xs rounded-2xl rounded-t-none hover:cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
            asChild
          >
            <button onClick={() => setClearOpen(true)} disabled={busy !== null}>
              <ItemMedia variant="icon">
                <Trash2Icon className="size-5 text-red-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-red-600 dark:text-red-400">
                  Clear All Data
                </ItemTitle>
              </ItemContent>
            </button>
          </Item>
          {/* <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
              Permanently delete all topics, entries, and notes. This cannot be
              undone — export your data first if you want to keep a copy.
            </p> */}
        </section>
      </main>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your topics, entries, and notes.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="not-dark:bg-muted/15 not-dark:hover:bg-muted/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleClear}>
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

export default DataSettingsPage;
