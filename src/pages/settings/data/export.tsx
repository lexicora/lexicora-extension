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
import { Switch } from "@/components/ui/switch";
import {
  DatabaseIcon,
  DownloadIcon,
  FileBracesCornerIcon,
  FileTextIcon,
  UploadIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRxCollection } from "rxdb/plugins/react";
import { toast } from "sonner";
import { downloadBackup } from "@/lib/backup";
import { downloadLibrary } from "@/lib/export";
import { navLock } from "@/lib/navigation-lock";
import { Label } from "@/components/ui/label";
import { SettingsItemSeparator } from "@/components/settings";
import { useAppStorage } from "@/hooks/use-app-storage";
import {
  exportCompactJsonStorage,
  exportMarkdownIncludeArchivedStorage,
} from "@/lib/storage/settings";

/** Disables the other action while one is running. */
type BusyAction = "export" | "export-markdown";

/**
 * One export: the button, and below it in the same card the one option that
 * shapes it, so an option is never read as applying to the other format.
 */
function ExportFormat({
  icon,
  title,
  onExport,
  disabled,
  option,
  caption,
}: {
  icon: ReactNode;
  title: string;
  onExport: () => void;
  disabled: boolean;
  option: {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  };
  caption: string;
}) {
  return (
    <div>
      <div className="rounded-2xl not-dark:shadow-xs">
        <Item
          variant="muted"
          size="sm"
          className="group transition-colors duration-150 bg-card hover:bg-card-hover! rounded-2xl rounded-b-none hover:cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
          asChild
        >
          <button onClick={onExport} disabled={disabled}>
            <ItemMedia variant="icon">{icon}</ItemMedia>
            <ItemContent>
              <ItemTitle>{title}</ItemTitle>
            </ItemContent>
            <DownloadIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-lc-muted-foreground-hover" />
          </button>
        </Item>
        <SettingsItemSeparator />
        {/* A label, so the whole row toggles the switch inside it. */}
        <Item
          variant="muted"
          size="xs"
          className="transition-none bg-card rounded-2xl rounded-t-none pl-10.5 pr-3 cursor-pointer"
          asChild
        >
          <label>
            <ItemContent>
              <span className="text-[13px] text-muted-foreground">
                {option.label}
              </span>
            </ItemContent>
            <Switch
              size="sm"
              className="data-[state=unchecked]:bg-gray-400 dark:data-[state=unchecked]:bg-gray-700"
              checked={option.checked}
              onCheckedChange={option.onCheckedChange}
              disabled={disabled}
            />
          </label>
        </Item>
      </div>
      <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
        {caption}
      </p>
    </div>
  );
}

/**
 * Getting the library out of Lexicora: a JSON backup the app can read back,
 * and Markdown notes for a vault.
 *
 * Kept apart from Storage, which holds the destructive actions — those should
 * not sit one tap from something done routinely.
 */
function ExportSettingsPage() {
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [compactJson, setCompactJson] = useAppStorage(exportCompactJsonStorage);
  const [includeArchived, setIncludeArchived] = useAppStorage(
    exportMarkdownIncludeArchivedStorage,
  );

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
      downloadBackup(
        {
          topics: topicsCollection,
          entries: entriesCollection,
          blocks: blocksCollection,
        },
        { compact: compactJson ?? true },
      );

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
          { skipArchived: !(includeArchived ?? true) },
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
              <ItemDescription className="text-pretty line-clamp-none">
                The JSON backup can be imported back from the Import page.
              </ItemDescription>
              {/* <ItemDescription className="text-pretty line-clamp-none">
                The JSON backup can be imported back into Lexicora, while the
                Markdown notes are ready for Obsidian / Tolaria or any editor.
              </ItemDescription> */}
            </ItemContent>
          </Item>
        </section>
        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <DatabaseIcon className="size-3.5 text-gray-400" /> Export as
          </Label>
          <div className="flex flex-col gap-4">
            <ExportFormat
              icon={<FileBracesCornerIcon className="size-5 text-gray-500" />}
              title={busy === "export" ? "Exporting..." : "JSON file"}
              onExport={handleExport}
              disabled={busy !== null}
              option={{
                label: "Compact",
                checked: compactJson ?? true,
                onCheckedChange: (checked) => void setCompactJson(checked),
              }}
              caption="A backup the Import page can read back. Turn off Compact for a file indented to be read."
            />
            <ExportFormat
              icon={<FileTextIcon className="size-5 text-blue-500" />}
              title={
                busy === "export-markdown" ? "Exporting..." : "Markdown Archive"
              }
              onExport={handleExportMarkdown}
              disabled={busy !== null}
              option={{
                label: "Include archived",
                checked: includeArchived ?? true,
                onCheckedChange: (checked) => void setIncludeArchived(checked),
              }}
              caption="A folder per topic, ready for Obsidian or any editor."
            />
          </div>
        </section>
      </main>
    </PageContainer>
  );
}

export default ExportSettingsPage;
