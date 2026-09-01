import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
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
import { SettingsItemSeparator } from "@/components/settings";
import { DownloadIcon, Trash2Icon } from "lucide-react";
import { useRxCollection } from "rxdb/plugins/react";
import { toast } from "sonner";

function DataSettingsPage() {
  const [clearOpen, setClearOpen] = useState(false);

  const topicsCollection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");

  const handleExport = () => {
    if (!topicsCollection || !entriesCollection || !blocksCollection) return;

    const p = async () => {
      const [topics, entries, blocks] = await Promise.all([
        topicsCollection.find().exec(),
        entriesCollection.find().exec(),
        blocksCollection.find().exec(),
      ]);

      const data = {
        exportedAt: new Date().toISOString(),
        version: 1,
        topics: topics.map((d) => d.toJSON()),
        entries: entries.map((d) => d.toJSON()),
        blocks: blocks.map((d) => d.toJSON()),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", "_")
        .replace(/:/g, "-");
      a.download = `lexicora-export-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    toast.promise(p(), {
      loading: "Exporting data...",
      success: "Data exported successfully",
      error: "Failed to export data",
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

      await Promise.all([
        topicsCollection.cleanup(0),
        entriesCollection.cleanup(0),
        blocksCollection.cleanup(0),
      ]);
    };

    toast.promise(p(), {
      loading: "Clearing all data...",
      success: "All data cleared",
      error: "Failed to clear data",
    });
  };

  return (
    <PageContainer>
      <PageHeader title="Data Management" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-1">
        <section className="flex flex-col gap-8">
          <article>
            <Item
              variant="muted"
              size="sm"
              className="group transition-colors duration-150 bg-card hover:bg-card-hover! not-dark:shadow-xs rounded-2xl hover:cursor-pointer /*bg-clip-padding*/"
              asChild
            >
              <button onClick={handleExport}>
                <ItemMedia variant="icon">
                  <DownloadIcon className="size-5 text-emerald-500" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Export All Data</ItemTitle>
                  {/*<ItemDescription>
                Download all your topics, entries, and notes as a JSON file.
              </ItemDescription>*/}
                </ItemContent>
              </button>
            </Item>
            <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
              Download all your topics, entries, and notes as a JSON file.
            </p>
          </article>
          <SettingsItemSeparator />
          <article>
            <Item
              variant="muted"
              size="sm"
              className="group transition-colors duration-150 bg-card hover:bg-card-hover! not-dark:shadow-xs rounded-2xl hover:cursor-pointer"
              asChild
            >
              <button onClick={() => setClearOpen(true)}>
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
            <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
              Permanently delete all topics, entries, and notes. This cannot be
              undone — export your data first if you want to keep a copy.
            </p>
          </article>
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
