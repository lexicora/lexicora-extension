import { useForm, Controller } from "react-hook-form";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldGroup,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { StarIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Combobox,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxEmpty,
  ComboboxCollection,
} from "@/components/ui/combobox";
import { TopicDocType } from "@/db/schemas/topic";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "../ui/input-group";

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(255, "Title is too long."),
  topicId: z.string().trim().min(36, "A topic must be selected."),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long.")
    .optional()
    .or(z.literal("")),
  tags: z.string(),
  faviconUrl: z.url("Must be a valid URL").optional().or(z.literal("")),
  url: z.url("Must be a valid URL").optional().or(z.literal("")),
  siteName: z.string().trim().max(100).optional().or(z.literal("")),
  languageCode: z.string().trim().max(10).optional().or(z.literal("")),
  isFavorite: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

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
}

export function EntryForm({
  id,
  initialData,
  overrideExisting = true,
  topics,
  onSubmit,
  isLoading,
}: EntryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
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
        setValue(name, newValue, { shouldValidate: true, shouldDirty: true });
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

  const watchTopicId = watch("topicId");
  const currentDescription = watch("description") || "";

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
            render={({ field }) => (
              <Combobox
                items={topics}
                itemToStringValue={(topic) => topic.name}
                itemToStringLabel={(topic) => topic.name}
                value={topics.find((t) => t.id === field.value) || null}
                onValueChange={(val) => field.onChange(val?.id || "")}
              >
                <div className="relative w-full">
                  <ComboboxInput
                    placeholder="Search or select a topic..."
                    className="w-full"
                    aria-invalid={!!errors.topicId}
                  />
                </div>
                <ComboboxContent className="z-50 w-[--radix-popover-trigger-width]">
                  <ComboboxEmpty>No topics found.</ComboboxEmpty>
                  {/*TODO: Add option to topic if topic with input name doesn't exist */}
                  <ComboboxList>
                    {(topic) => (
                      <ComboboxItem key={topic.id} value={topic}>
                        {topic.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
          {errors.topicId && <FieldError errors={[errors.topicId]} />}

          {/* Debug/Fallback representation of selected topic name (remove later)*/}
          {watchTopicId && topics.some((t) => t.id === watchTopicId) && (
            <div className="text-xs text-muted-foreground mt-1">
              Selected: {topics.find((t) => t.id === watchTopicId)?.name}
            </div>
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
          <Input
            id="title"
            placeholder="Entry Title"
            aria-invalid={!!errors.title}
            {...register("title")}
            className="text-base! py-2"
          />
          {errors.title && <FieldError errors={[errors.title]} />}
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
              {errors.tags && <FieldError errors={[errors.tags]} />}
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
                    {currentDescription.length}/500 characters
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.description && (
                <FieldError errors={[errors.description]} />
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
                {errors.siteName && <FieldError errors={[errors.siteName]} />}
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
                  <FieldError errors={[errors.languageCode]} />
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
              {errors.url && <FieldError errors={[errors.url]} />}
            </Field>

            <Field data-invalid={!!errors.faviconUrl} className="gap-2">
              <Label
                htmlFor="faviconUrl"
                className={cn("ml-1", errors.faviconUrl && "text-destructive")}
              >
                Favicon URL
              </Label>
              <div className="flex items-end gap-3">
                <Avatar
                  className="flex shrink-0 size-8.5 my-px"
                  onClick={() => document.getElementById("faviconUrl")?.focus()}
                >
                  <AvatarImage
                    className="rounded-md"
                    src={watch("faviconUrl") || undefined}
                    alt="Favicon"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNlZWVlZWUiIHJ4PSIyIiByeT0iMiIvPjwvc3ZnPg==";
                    }}
                  />
                  <AvatarFallback />
                </Avatar>
                <Input
                  id="faviconUrl"
                  placeholder="e.g. https://example.com/favicon.ico"
                  aria-invalid={!!errors.faviconUrl}
                  {...register("faviconUrl")}
                />
                {errors.faviconUrl && (
                  <FieldError errors={[errors.faviconUrl]} />
                )}
              </div>
            </Field>

            <Field className="mb-2">
              <div className="flex items-center justify-center pt-2">
                <Controller
                  control={control}
                  name="isFavorite"
                  render={({ field }) => (
                    <Toggle
                      type="button"
                      variant="outline"
                      size="sm"
                      pressed={field.value}
                      onPressedChange={field.onChange}
                      title="Mark as Favorite"
                      className={cn(
                        "transition-colors",
                        field.value
                          ? "bg-lc-muted-foreground-hover text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      <StarIcon
                        fill={field.value ? "currentColor" : "none"}
                        className={cn(
                          "size-4",
                          field.value && "text-yellow-500 fill-yellow-500",
                        )}
                      />
                      Favorite
                    </Toggle>
                  )}
                />
              </div>
            </Field>
          </CollapsibleContent>
        </Collapsible>
      </FieldGroup>
    </form>
  );
}
