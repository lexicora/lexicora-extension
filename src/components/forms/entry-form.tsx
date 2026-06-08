import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { TopicDocType } from "@/db/schemas/topic";
import { useTabSupport } from "@/hooks/use-tab-support";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, RefreshCw, StarIcon } from "lucide-react";
import { Avatar } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(255, "Title is too long."),
  topicId: z.string().trim().min(1, "A topic must be selected."),
  description: z
    .string()
    .trim()
    .max(1000, "Description is too long.")
    .optional()
    .or(z.literal("")),
  tags: z.string().max(550, "Tags input is too long."), // TODO: Improve validation, we will split and validate individual tags later also filter out duplicates
  faviconUrl: z
    .url("Must be a valid URL")
    .max(1000, "Favicon URL is too long.")
    .optional()
    .or(z.literal("")),
  url: z
    .url("Must be a valid URL")
    .max(2048, "URL is too long.")
    .optional()
    .or(z.literal("")),
  siteName: z
    .string()
    .trim()
    .max(150, "Site name is too long.")
    .optional()
    .or(z.literal("")),
  languageCode: z
    .string()
    .trim()
    .max(10, "Language code is too long.")
    .optional()
    .or(z.literal("")),
  isFavorite: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type SourceField = "url" | "siteName" | "faviconUrl" | "languageCode" | "description";

export type EntryFormApi = {
  setFieldValue: (name: SourceField, value: string) => void;
  getFieldValue: (name: SourceField) => string;
};

export interface EntryFormData {
  title: string;
  topicId: string;
  description: string;
  tags: string[];
  faviconUrl: string;
  url: string;
  siteName: string;
  languageCode: string;
  isFavorite: boolean;
}

interface EntryFormProps {
  id?: string;
  initialData?: Partial<EntryFormData>;
  overrideExisting?: boolean;
  topics: TopicDocType[];
  onSubmit: (data: EntryFormData) => void | Promise<void>;
  isLoading?: boolean;
  onFormReady?: (api: EntryFormApi) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function EntryForm({
  id,
  initialData,
  overrideExisting = true,
  topics,
  onSubmit,
  isLoading,
  onFormReady,
  onDirtyChange,
}: EntryFormProps) {
  const { isSupported } = useTabSupport();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Applying the zodResolver
    defaultValues: {
      title: initialData?.title || "",
      topicId: initialData?.topicId || "",
      description: initialData?.description || "",
      tags: initialData?.tags?.join(", ") || "",
      faviconUrl: initialData?.faviconUrl || "",
      url: initialData?.url || "",
      siteName: initialData?.siteName || "",
      languageCode: initialData?.languageCode || navigator.language || "en",
      isFavorite: initialData?.isFavorite || false,
    },
  });

  const prevInitialDataId = useRef<string | null>(null);
  const [topicInputValue, setTopicInputValue] = useState("");
  const topicDisplayInitialized = useRef(false);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onFormReady?.({
      setFieldValue: (name, value) =>
        setValue(name, value, { shouldDirty: true }),
      getFieldValue: (name) => (getValues(name) as string) ?? "",
    });
  }, []);

  const watchTopicId = watch("topicId");

  // When loading a pre-selected topicId (e.g. entry-edit), seed the combobox
  // input text with the matching topic name once topics are available.
  // Without this, the controlled inputValue stays "" and the placeholder shows.
  useEffect(() => {
    if (topicDisplayInitialized.current) return;
    if (!watchTopicId || !topics.length) return;
    const matched = topics.find((t) => t.id === watchTopicId);
    if (matched) {
      setTopicInputValue(matched.name);
      topicDisplayInitialized.current = true;
    }
  }, [topics, watchTopicId]);

  const currentDescription = watch("description") || "";

  useEffect(() => {
    if (!initialData) return;

    // Simple hash/stringification to avoid infinite loops if initialData object reference changes but content doesn't.
    // If performance is an issue, a more granular check or passing individual values could be done.
    const currentDataId = JSON.stringify(initialData);
    if (prevInitialDataId.current === currentDataId) return;
    prevInitialDataId.current = currentDataId;

    const updateField = (name: keyof FormValues, newValue: any) => {
      if (newValue === undefined || newValue === null) return;
      if (overrideExisting || !getValues(name)) {
        setValue(name, newValue, { shouldDirty: true });
      }
    };

    updateField("title", initialData.title);
    updateField("topicId", initialData.topicId);
    updateField("description", initialData.description);
    if (initialData.tags && initialData.tags.length > 0) {
      updateField("tags", initialData.tags.join(", "));
    } else if (initialData.tags !== undefined) {
      updateField("tags", ""); // fallback for empty array
    }
    updateField("faviconUrl", initialData.faviconUrl);
    updateField("url", initialData.url);
    updateField("siteName", initialData.siteName);
    updateField("languageCode", initialData.languageCode);
    updateField("isFavorite", initialData.isFavorite);
  }, [initialData, overrideExisting, setValue, getValues]);

  const onValidSubmit = (data: FormValues) => {
    const tagsArray = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);

    onSubmit({
      title: data.title,
      topicId: data.topicId,
      description: data.description || "",
      tags: tagsArray,
      faviconUrl: data.faviconUrl || "",
      url: data.url || "",
      siteName: data.siteName || "",
      languageCode: data.languageCode || "",
      isFavorite: data.isFavorite,
    });
  };

  const handleFetchMetadata = async () => {
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || !tab.id) return;

      const [{ result }] = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          let faviconUrl =
            document.querySelector('link[rel="icon"]')?.getAttribute("href") ||
            document
              .querySelector('link[rel="shortcut icon"]')
              ?.getAttribute("href") ||
            document
              .querySelector('link[rel="apple-touch-icon"]')
              ?.getAttribute("href") ||
            null;

          if (faviconUrl) {
            try {
              faviconUrl = new URL(faviconUrl, document.baseURI).href;
            } catch (e) {
              faviconUrl = null;
            }
          } else {
            try {
              faviconUrl = new URL("/favicon.ico", document.baseURI).href;
            } catch (e) {
              faviconUrl = null;
            }
          }

          const siteName =
            document
              .querySelector('meta[property="og:site_name"]')
              ?.getAttribute("content") || null;
          const languageCode =
            document.documentElement.lang || navigator.language || "en";

          return {
            faviconUrl,
            siteName,
            hostname: document.location.hostname,
            url: document.location.href,
            languageCode,
          };
        },
      });

      if (result) {
        setValue("faviconUrl", result.faviconUrl || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("url", result.url || "", {
          shouldValidate: true,
          shouldDirty: true,
        });

        let formattedSiteName = result.siteName;
        // if (!formattedSiteName && result.hostname) {
        //   const parts = result.hostname.split(".");
        //   let domain = parts.length > 1 ? parts[parts.length - 2] : parts[0];
        //   const commonSlds = ["co", "com", "org", "net", "gov", "edu", "ac"];
        //   if (commonSlds.includes(domain) && parts.length >= 3) {
        //     domain = parts[parts.length - 3];
        //   }
        //   formattedSiteName = domain.charAt(0).toUpperCase() + domain.slice(1);
        // }

        setValue("siteName", formattedSiteName || result.hostname || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("languageCode", result.languageCode || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch metadata:", err);
    }
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmit(onValidSubmit)}
      className="py-3.5 space-y-4"
    >
      <FieldGroup className="">
        <Field data-invalid={!!errors.topicId} className="gap-2">
          <Label
            htmlFor="topicId"
            className={cn(
              "font-semibold ml-1",
              errors.topicId && "text-destructive",
            )}
          >
            Topic
          </Label>
          <Controller
            control={control}
            name="topicId"
            render={({ field }) => {
              const typed = topicInputValue.trim();

              // Only non-archived topics are selectable; check all topics for name uniqueness.
              const availableTopics = topics.filter((t) => !t.isArchived);
              const hasExactTopicMatch = topics.some(
                (t) => t.name.toLowerCase() === typed.toLowerCase(),
              );

              const isCustomValue =
                field.value && !topics.some((t) => t.id === field.value);

              // The original archived topic from initialData — always kept in the list so
              // the user can revert back to it after switching away.
              const originalArchivedTopic = initialData?.topicId
                ? topics.find((t) => t.id === initialData.topicId && t.isArchived)
                : undefined;

              // If the *current* selection (after a change) is a different archived topic,
              // include it too — but keep it disabled since it wasn't the original.
              const currentArchivedTopic =
                field.value && field.value !== originalArchivedTopic?.id
                  ? topics.find((t) => t.id === field.value && t.isArchived)
                  : undefined;

              // When typing matches archived topic names, surface them as disabled items
              // so the user understands why nothing is selectable and "Create" is blocked.
              const typedMatchingArchivedTopics = typed
                ? topics.filter(
                    (t) =>
                      t.isArchived &&
                      t.name.toLowerCase().includes(typed.toLowerCase()) &&
                      (!currentArchivedTopic || t.id !== currentArchivedTopic.id) &&
                      (!originalArchivedTopic || t.id !== originalArchivedTopic.id),
                  )
                : [];

              const comboboxItems = [
                ...availableTopics,
                ...(typed && !hasExactTopicMatch
                  ? [{ id: typed, name: `Create "${typed}"` }]
                  : []),
                ...(isCustomValue && field.value !== typed
                  ? [{ id: field.value, name: field.value }]
                  : []),
                ...(originalArchivedTopic ? [originalArchivedTopic] : []),
                ...(currentArchivedTopic ? [currentArchivedTopic] : []),
                ...typedMatchingArchivedTopics,
              ];

              const selectedValue =
                comboboxItems.find((t) => t.id === field.value) || null;

              return (
                <Combobox
                  items={comboboxItems}
                  itemToStringValue={(topic) => topic.name}
                  itemToStringLabel={(topic) =>
                    topic.name.startsWith('Create "') ? topic.id : topic.name
                  }
                  value={selectedValue}
                  onValueChange={(val) => {
                    field.onChange(val?.id || "");
                    if (val?.id) setTopicInputValue("");
                  }}
                  inputValue={topicInputValue}
                  onInputValueChange={(val) => setTopicInputValue(val)}
                >
                  <div className="relative w-full">
                    <ComboboxInput
                      placeholder="Search or select a topic..."
                      className="w-full"
                      aria-invalid={!!errors.topicId}
                      onBlur={(e) => {
                        if (typed && !field.value && !hasExactTopicMatch) {
                          field.onChange(typed);
                        }
                      }}
                    />
                  </div>
                  <ComboboxContent className="z-50 scrollbar-bg-transparent w-[--radix-popover-trigger-width]">
                    <ComboboxEmpty>Type to create a new topic.</ComboboxEmpty>
                    <ComboboxList>
                      {(topic) => {
                        const isArchived =
                          "isArchived" in topic &&
                          (topic as TopicDocType).isArchived === true;
                        const isRevertable = isArchived && topic.id === originalArchivedTopic?.id;
                        return (
                          <ComboboxItem
                            key={topic.id}
                            value={topic}
                            disabled={isArchived && !isRevertable}
                          >
                            <span className="truncate min-w-0 flex-1">
                              {topic.name}
                            </span>
                            {isArchived && (
                              <span className="shrink-0 text-xs text-muted-foreground italic">
                                Archived
                              </span>
                            )}
                          </ComboboxItem>
                        );
                      }}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              );
            }}
          />
          {errors.topicId && (
            <FieldError className="text-center" errors={[errors.topicId]} />
          )}
        </Field>
        <Field data-invalid={!!errors.title} className="gap-2">
          <Label
            htmlFor="title"
            className={cn(
              "font-semibold ml-1",
              errors.title && "text-destructive",
            )}
          >
            Title
          </Label>
          {/* <Input
            id="title"
            placeholder="Entry Title"
            aria-invalid={!!errors.title}
            {...register("title")}
            className="text-base! py-2"
          /> */}
          <InputGroup>
            <InputGroupInput
              id="title"
              placeholder="Entry Title"
              aria-invalid={!!errors.title}
              {...register("title")}
              className="text-base! py-2"
            />
            {/* TODO: Maybe add dropdown menu to also pin and favorite it */}
            <InputGroupAddon align="inline-end" className="pr-2 py-0.5">
              <Controller
                control={control}
                name="isFavorite"
                render={({ field }) => (
                  <Toggle
                    type="button"
                    variant="default"
                    size="sm"
                    pressed={field.value}
                    onPressedChange={field.onChange}
                    title="Mark as Favorite"
                    className={cn(
                      "p-0 size-6.5 min-w-6.5 rounded-[3px] transition-colors not-focus-visible:ring-0! bg-transparent! hover:bg-transparent active:bg-transparent",
                    )}
                  >
                    <StarIcon
                      fill={field.value ? "currentColor" : "none"}
                      className={cn(
                        "size-4",
                        field.value && "text-yellow-500 fill-yellow-500",
                      )}
                    />
                  </Toggle>
                )}
              />
            </InputGroupAddon>
          </InputGroup>
          {errors.title && (
            <FieldError className="text-center" errors={[errors.title]} />
          )}
        </Field>

        <Collapsible className="w-full">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex justify-between py-1 px-2 dark:hover:bg-muted"
            >
              <span className="text-sm font-medium text-muted-foreground">
                Additional fields & metadata...
              </span>
              <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <Field data-invalid={!!errors.tags} className="gap-2">
              <Label
                htmlFor="tags"
                className={cn("ml-1", errors.tags && "text-destructive")}
              >
                Tags{" "}
                <span className="text-muted-foreground">(comma-separated)</span>
              </Label>
              <Input
                id="tags"
                placeholder="e.g. documentation, context (max 10 allowed)"
                aria-invalid={!!errors.tags}
                {...register("tags")}
              />
              {errors.tags && (
                <FieldError className="text-center" errors={[errors.tags]} />
              )}
            </Field>
            <Field data-invalid={!!errors.description} className="gap-2">
              <Label
                htmlFor="description"
                className={cn("ml-1", errors.description && "text-destructive")}
              >
                Description
              </Label>
              <InputGroup>
                <InputGroupTextarea
                  id="description"
                  placeholder="A brief description of this entry"
                  rows={3}
                  className="min-h-16 max-h-48 resize-none scrollbar-thin scrollbar-bg-transparent"
                  aria-invalid={!!errors.description}
                  {...register("description")}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums ml-auto text-sm">
                    {currentDescription.length}/1000 characters
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.description && (
                <FieldError
                  className="text-center"
                  errors={[errors.description]}
                />
              )}
            </Field>
            <Separator className="max-w-200 mx-auto mb-6 mt-7" />
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.siteName} className="gap-2">
                <Label
                  htmlFor="siteName"
                  className={cn("ml-1", errors.siteName && "text-destructive")}
                >
                  Site Name
                </Label>
                <Input
                  id="siteName"
                  placeholder="e.g. GitHub"
                  aria-invalid={!!errors.siteName}
                  {...register("siteName")}
                />
                {errors.siteName && (
                  <FieldError
                    className="text-center"
                    errors={[errors.siteName]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.languageCode} className="gap-2">
                <Label
                  htmlFor="languageCode"
                  className={cn(
                    "ml-1",
                    errors.languageCode && "text-destructive",
                  )}
                >
                  Language
                </Label>
                <Input
                  id="languageCode"
                  placeholder="e.g. en"
                  aria-invalid={!!errors.languageCode}
                  {...register("languageCode")}
                />
                {errors.languageCode && (
                  <FieldError
                    className="text-center"
                    errors={[errors.languageCode]}
                  />
                )}
              </Field>
            </div>
            <Field data-invalid={!!errors.url} className="gap-2">
              <Label
                htmlFor="url"
                className={cn("ml-1", errors.url && "text-destructive")}
              >
                URL
              </Label>
              <Input
                id="url"
                placeholder="e.g. https://example.com/path"
                aria-invalid={!!errors.url}
                {...register("url")}
              />
              {errors.url && (
                <FieldError className="text-center" errors={[errors.url]} />
              )}
            </Field>

            <Field data-invalid={!!errors.faviconUrl} className="gap-2">
              <Label
                htmlFor="faviconUrl"
                className={cn("ml-1", errors.faviconUrl && "text-destructive")}
              >
                Favicon URL
              </Label>
              <div className="flex items-end gap-3">
                <Avatar.Root
                  className="flex shrink-0 size-8.5 my-px"
                  onClick={() => document.getElementById("faviconUrl")?.focus()}
                >
                  <Avatar.Image
                    className="rounded-md"
                    src={watch("faviconUrl") || undefined}
                    alt="Favicon"
                    // onError={(e) => {
                    //   (e.target as HTMLImageElement).src =
                    //     "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNlZWVlZWUiIHJ4PSIyIiByeT0iMiIvPjwvc3ZnPg==";
                    // }}
                  />
                  <Avatar.Fallback delayMs={500}>
                    <div className="bg-gray-200 dark:bg-gray-800 size-8.5 rounded-md"></div>
                  </Avatar.Fallback>
                </Avatar.Root>
                <Input
                  id="faviconUrl"
                  placeholder="e.g. https://example.com/favicon.ico"
                  aria-invalid={!!errors.faviconUrl}
                  {...register("faviconUrl")}
                />
              </div>
              {errors.faviconUrl && (
                <FieldError
                  className="text-center"
                  errors={[errors.faviconUrl]}
                />
              )}
            </Field>

            <Field className="mb-2">
              <div
                title={isSupported ? "" : "Unsupported Page"}
                className={cn(
                  "flex items-center justify-center gap-2 pt-2",
                  !isSupported && "cursor-not-allowed",
                )}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  title="Fetch current tab's metadata"
                  onClick={handleFetchMetadata}
                  className="shrink-0 text-muted-foreground"
                  disabled={!isSupported}
                >
                  <RefreshCw className="size-4" /> Refresh Metadata
                </Button>
              </div>
            </Field>
          </CollapsibleContent>
        </Collapsible>
      </FieldGroup>
    </form>
  );
}
