import { useRef, useState } from "react";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SettingsItemSeparator } from "@/components/settings";
import {
  Item,
  ItemActions,
  ItemTitle,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DownloadIcon,
  FileBracesCornerIcon,
  GitMergeIcon,
  ListPlusIcon,
  LockKeyholeIcon,
  ReplaceAllIcon,
} from "lucide-react";
import { useRxCollection } from "rxdb/plugins/react";
import { toast } from "sonner";
import {
  BackupFormatError,
  describeImport,
  importBackup,
  parseBackup,
  summarizeImport,
  type ImportMode,
  type ImportProgress,
  type ImportResult,
} from "@/lib/backup";
import { navLock } from "@/lib/navigation-lock";

const MODES: Array<{
  value: ImportMode;
  title: string;
  description: string;
  Icon: typeof GitMergeIcon;
  activeColor: string;
}> = [
  {
    value: "skip",
    title: "Keep existing",
    description:
      "Adds what is missing and leaves everything already here untouched, even if the file has a newer copy.",
    Icon: LockKeyholeIcon,
    activeColor: "text-sky-500",
  },
  {
    value: "merge",
    title: "Merge, newer wins",
    description:
      "Adds what is missing. Where an item is both in the file and already here, the copy edited more recently is kept.",
    Icon: GitMergeIcon,
    activeColor: "text-emerald-500",
  },
  {
    value: "replace",
    title: "Replace library",
    description:
      "Deletes every topic, entry and note first, then restores the file. The same as clearing all data and importing.",
    Icon: ReplaceAllIcon,
    activeColor: "text-red-500",
  },
];

const STAGE_LABEL: Record<ImportProgress["stage"], string> = {
  topics: "topics",
  entries: "entries",
  notes: "notes",
};

/**
 * Reading a JSON backup back in. The choice that matters is what happens to
 * items that are both in the file and already here; it is made up front, and
 * replacing the library asks once more before it starts.
 */
function ImportSettingsPage() {
  const [mode, setMode] = useState<ImportMode>("merge");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const topicsCollection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");

  const runImport = async (file: File) => {
    if (!topicsCollection || !entriesCollection || !blocksCollection) return;

    const toastId = toast.loading("Reading file...");
    setBusy(true);
    setResult(null);
    // Half a library is worse than none, so navigation is held until it is in.
    navLock.lock();

    try {
      const backup = parseBackup(await file.text());
      const imported = await importBackup(
        {
          topics: topicsCollection,
          entries: entriesCollection,
          blocks: blocksCollection,
        },
        backup,
        mode,
        ({ stage, done, total }) =>
          toast.loading(
            total === 0
              ? `Importing ${STAGE_LABEL[stage]}...`
              : `Importing ${STAGE_LABEL[stage]}: ${done} of ${total}...`,
            { id: toastId },
          ),
      );
      setResult(imported);
      toast.success(summarizeImport(imported), { id: toastId });
    } catch (e) {
      console.error("Failed to import backup:", e);
      toast.error(
        e instanceof BackupFormatError ? e.message : "Failed to import",
        { id: toastId },
      );
    } finally {
      navLock.unlock();
      setBusy(false);
    }
  };

  const handleFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again fires a change event.
    event.target.value = "";
    if (!file) return;

    if (mode === "replace") {
      setPendingFile(file);
      setConfirmOpen(true);
    } else {
      void runImport(file);
    }
  };

  const handleConfirmReplace = () => {
    const file = pendingFile;
    setPendingFile(null);
    if (file) void runImport(file);
  };

  const collectionsReady =
    !!topicsCollection && !!entriesCollection && !!blocksCollection;

  return (
    <PageContainer>
      <PageHeader title="Import" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-1">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon">
                <DownloadIcon className="size-8 text-cyan-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                Restore a JSON backup made by Lexicora. Choose what happens to
                items that are already here, then pick the file. Navigation is
                paused while it runs.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>

        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <GitMergeIcon className="size-3.5 text-gray-400" /> Existing items
          </Label>
          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as ImportMode)}
            disabled={busy}
            className="gap-0 not-dark:shadow-xs rounded-2xl"
          >
            {MODES.map(({ value, title, Icon, activeColor }, index) => (
              <div key={value}>
                {index > 0 && <SettingsItemSeparator />}
                <Item
                  variant="muted"
                  size="sm"
                  className={`group transition-none hover:cursor-pointer bg-card ${
                    index === 0
                      ? "rounded-2xl rounded-b-none"
                      : index === MODES.length - 1
                        ? "rounded-2xl rounded-t-none"
                        : "rounded-none"
                  }`}
                  onClick={() => !busy && setMode(value)}
                >
                  <ItemMedia variant="icon">
                    <Icon
                      className={`size-5 ${mode === value ? activeColor : "text-gray-500"}`}
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle
                      className={
                        value === "replace"
                          ? "text-red-600 dark:text-red-400"
                          : ""
                      }
                    >
                      {title}
                    </ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <RadioGroupItem
                      value={value}
                      className="not-dark:bg-gray-200 not-dark:border-gray-400/50"
                    />
                  </ItemActions>
                </Item>
              </div>
            ))}
          </RadioGroup>
          <p className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2">
            {MODES.find((m) => m.value === mode)?.description}
          </p>
        </section>

        <section>
          <Label className="text-sm ml-2 mb-0.5">
            <ListPlusIcon className="size-3.5 text-gray-400" /> Import from
          </Label>
          <Item
            variant="muted"
            size="sm"
            className="group transition-colors duration-150 bg-card hover:bg-card-hover! not-dark:shadow-xs rounded-2xl hover:cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
            asChild
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={busy || !collectionsReady}
            >
              <ItemMedia variant="icon">
                <FileBracesCornerIcon className="size-5 text-gray-500" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{busy ? "Importing..." : "JSON file"}</ItemTitle>
              </ItemContent>
            </button>
          </Item>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChosen}
          />
          {result && (
            <ul className="text-pretty text-xs text-muted-foreground mx-2.5 mt-2 flex flex-col gap-0.5">
              {describeImport(result).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPendingFile(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Replace your library?</AlertDialogTitle>
            <AlertDialogDescription>
              Every topic, entry and note currently here will be permanently
              deleted before the file is restored. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="not-dark:bg-muted/15 not-dark:hover:bg-muted/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmReplace}
            >
              Replace Library
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

export default ImportSettingsPage;
