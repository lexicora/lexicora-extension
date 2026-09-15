import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { DownloadIcon, FileTextIcon } from "lucide-react";
import { useRxCollection } from "rxdb/plugins/react";
import { toast } from "sonner";
import { downloadBlob } from "@/lib/export/download";
import { downloadLibrary } from "@/lib/export";
import { navLock } from "@/lib/navigation-lock";

/** Disables the other action while one is running. */
type BusyAction = "export" | "export-markdown";

/**
 * Getting the library out of Lexicora: a JSON backup the app can read back,
 * and Markdown notes for a vault.
 *
 * Kept apart from Storage, which holds the destructive actions — those should
 * not sit one tap from something done routinely.
 */
function ExportSettingsPage() {
  const [busy, setBusy] = useState<BusyAction | null>(null);

  const topicsCollection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");

  const runExclusive = (action: BusyAction, work: () => Promise<void>) => {
    setBusy(action);
    return work().finally(() => setBusy(null));
  };

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
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", "_")
        .replace(/:/g, "-");
      downloadBlob(blob, `lexicora-export-${timestamp}.json`);
    };

    toast.promise(runExclusive("export", p), {
      loading: "Exporting data...",
      success: "Data exported successfully",
      error: "Failed to export data",
    });
  };

  const handleExportMarkdown = () => {
    if (!topicsCollection || !entriesCollection || !blocksCollection) return;

    const toastId = toast.loading("Preparing export...");
    // A large library takes a while, and half of it is written by the time the
    // user could navigate away, so navigation is held until it finishes.
    navLock.lock();

    runExclusive("export-markdown", async () => {
      try {
        const topicCount = await downloadLibrary(
          {
            topics: topicsCollection,
            entries: entriesCollection,
            blocks: blocksCollection,
          },
          ({ done, total }) =>
            toast.loading(`Exporting topic ${done} of ${total}...`, {
              id: toastId,
            }),
        );

        if (topicCount === 0) {
          toast.info("Nothing to export yet", { id: toastId });
        } else {
          toast.success(
            `Exported ${topicCount} ${topicCount === 1 ? "topic" : "topics"}`,
            { id: toastId },
          );
        }
      } catch (e) {
        console.error("Failed to export as Markdown:", e);
        toast.error("Failed to export", { id: toastId });
      } finally {
        navLock.unlock();
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader title="Export" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-1">
        <section className="flex flex-col gap-8">
          <article>
            <Item
              variant="muted"
              size="sm"
              className="group transition-colors duration-150 bg-card hover:bg-card-hover! not-dark:shadow-xs rounded-2xl hover:cursor-pointer disabled:opacity-55 disabled:pointer-events-none /*bg-clip-padding*/"
              asChild
            >
              <button onClick={handleExport} disabled={busy !== null}>
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
          <article>
            <Item
              variant="muted"
              size="sm"
              className="group transition-colors duration-150 bg-card hover:bg-card-hover! not-dark:shadow-xs rounded-2xl hover:cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
              asChild
            >
              <button onClick={handleExportMarkdown} disabled={busy !== null}>
                <ItemMedia variant="icon">
                  <FileTextIcon className="size-5 text-blue-500" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {busy === "export-markdown"
                      ? "Exporting..."
                      : "Export as Markdown"}
                  </ItemTitle>
                </ItemContent>
              </button>
            </Item>
            <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
              Download everything as a zip of Markdown notes — a folder per
              topic, ready for Obsidian or any editor. A large library takes a
              moment, and navigation is paused while it runs.
            </p>
          </article>
        </section>
      </main>
    </PageContainer>
  );
}

export default ExportSettingsPage;
