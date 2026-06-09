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
import { SettingsItemSeperator } from "@/components/settings";
import { DownloadIcon, Trash2Icon } from "lucide-react";
import { useRxCollection } from "rxdb/plugins/react";
import { toast } from "sonner";

function DataSettingsPage() {
  // TODO: Re-enable clear all data once the soft-delete issue is resolved.
  // RxDB's bulkRemove() only soft-deletes documents (sets "_deleted": true); it does
  // not physically remove them from IndexedDB. As a result, on closing and reopening
  // the extension the soft-deleted documents reappear in the UI despite the flag still
  // being set. This should be investigated when implementing the cleanup logic that
  // physically purges soft-deleted documents from IndexedDB.
  //
  // Before re-enabling, also verify transaction finality per rxdb.info:
  //   // .commit() is not available on all browsers, so first check if it exists.
  //   if (transaction.commit) {
  //     transaction.commit()
  //   }
  //
  // See: https://rxdb.info/cleanup.html
  // const [clearOpen, setClearOpen] = useState(false);

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

  // const handleClear = () => {
  //   if (!topicsCollection || !entriesCollection || !blocksCollection) return;
  //
  //   const p = async () => {
  //     const [topicDocs, entryDocs, blockDocs] = await Promise.all([
  //       topicsCollection.find().exec(),
  //       entriesCollection.find().exec(),
  //       blocksCollection.find().exec(),
  //     ]);
  //
  //     await Promise.all([
  //       topicsCollection.bulkRemove(topicDocs),
  //       entriesCollection.bulkRemove(entryDocs),
  //       blocksCollection.bulkRemove(blockDocs),
  //     ]);
  //   };
  //
  //   toast.promise(p(), {
  //     loading: "Clearing all data...",
  //     success: "All data cleared",
  //     error: "Failed to clear data",
  //   });
  // };

  return (
    <PageContainer>
      <PageHeader title="Data Management" goBackButton />
      <main className="flex flex-col gap-6.5 w-full pt-4.5 px-1.25 mb-2">
        <section className="flex flex-col gap-8">
          <article>
            <Item
              variant="muted"
              size="sm"
              className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl hover:cursor-pointer /*bg-clip-padding*/"
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
            <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-1">
              Download all your topics, entries, and notes as a JSON file.
            </p>
          </article>
          {/*<SettingsItemSeperator />*/}
          {/* Clear All Data — temporarily disabled: RxDB soft-delete does not
              physically remove documents from IndexedDB, causing data to reappear
              after reopening the extension. See the TODO comment above. */}
          {/*
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl rounded-t-none hover:cursor-pointer"
            onClick={() => setClearOpen(true)}
          >
            <ItemMedia variant="icon">
              <Trash2Icon className="size-5 text-red-500" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="text-red-600 dark:text-red-400">
                Clear All Data
              </ItemTitle>
              <ItemDescription>
                Permanently delete all topics, entries, and notes
              </ItemDescription>
            </ItemContent>
          </Item>
          */}
          <article className="opacity-65 grayscale-30">
            <Item
              variant="muted"
              size="sm"
              className="bg-slate-200/75 dark:bg-muted/50 rounded-2xl"
            >
              <ItemMedia variant="icon">
                <Trash2Icon className="size-5 text-red-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-red-600 dark:text-red-400">
                  Clear All Data
                </ItemTitle>
                {/*<ItemDescription className="line-clamp-none">
                  To clear all data, remove and reinstall the extension. This
                  feature will be re-enabled in a future update.
                </ItemDescription>*/}
              </ItemContent>
            </Item>
            <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-1">
              To clear all data, remove and reinstall the extension. This
              feature will be re-enabled in a future update.
            </p>
          </article>
        </section>
      </main>

      {/* AlertDialog for clear confirmation — disabled until soft-delete issue is resolved */}
      {/*
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleClear}>
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      */}
    </PageContainer>
  );
}

export default DataSettingsPage;
