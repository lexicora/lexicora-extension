import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Item,
  ItemTitle,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
} from "@/components/ui/item";
import {
  DatabaseIcon,
  FileBracesCornerIcon,
  FileTextIcon,
  UploadIcon,
} from "lucide-react";
import { useRxCollection } from "rxdb/plugins/react";
import { toast } from "sonner";
import { downloadBackup } from "@/lib/backup";
import { downloadLibrary } from "@/lib/export";
import { navLock } from "@/lib/navigation-lock";
import { Label } from "@/components/ui/label";
import { SettingsItemSeparator } from "@/components/settings";

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

    // The file's shape lives in lib/backup, shared with the Import page.
    const p = () =>
      downloadBackup({
        topics: topicsCollection,
        entries: entriesCollection,
        blocks: blocksCollection,
      });

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
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon">
                <UploadIcon className="size-8 text-emerald-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                Export your library as a JSON backup or a zip of Markdown notes.
                A large library takes a moment, and navigation is paused while
                it runs.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>
        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <DatabaseIcon className="size-3.5 text-gray-400" /> Export as
          </Label>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-card hover:bg-card-hover! not-dark:shadow-xs rounded-2xl rounded-b-none hover:cursor-pointer disabled:opacity-55 disabled:pointer-events-none /*bg-clip-padding*/"
            asChild
          >
            <button onClick={handleExport} disabled={busy !== null}>
              <ItemMedia variant="icon">
                <FileBracesCornerIcon className="size-5 text-gray-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>JSON file</ItemTitle>
                {/*<ItemDescription>
                Download all your topics, entries, and notes as a JSON file.
              </ItemDescription>*/}
              </ItemContent>
            </button>
          </Item>
          {/* <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
              Download all your topics, entries, and notes as a JSON file.
          </p> */}
          <SettingsItemSeparator />
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-card hover:bg-card-hover! not-dark:shadow-xs rounded-2xl rounded-t-none hover:cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
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
                    : "Markdown Archive"}
                </ItemTitle>
              </ItemContent>
            </button>
          </Item>
          {/* <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
              Download everything as a zip of Markdown notes — a folder per
              topic, ready for Obsidian or any editor. A large library takes a
              moment, and navigation is paused while it runs.
          </p> */}
        </section>
      </main>
    </PageContainer>
  );
}

export default ExportSettingsPage;
