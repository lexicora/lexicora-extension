import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(255, "Title is too long."),
  topicId: z.string().trim().min(36, "A topic must be selected."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  tags: z.string(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  originUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
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
  url: string;
  originUrl: string;
  siteName: string;
  languageCode: string;
  isFavorite: boolean;
}

interface EntryFormProps {
  id?: string;
  initialData?: Partial<EntryFormData>;
  topics: TopicDocType[];
  onSubmit: (data: EntryFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function EntryForm({
  id,
  initialData,
  topics,
  onSubmit,
  isLoading,
}: EntryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Applying the zodResolver
    defaultValues: {
      title: initialData?.title || "",
      topicId: initialData?.topicId || "",
      description: initialData?.description || "",
      tags: initialData?.tags?.join(", ") || "",
      url: initialData?.url || "",
      originUrl: initialData?.originUrl || "",
      siteName: initialData?.siteName || "",
      languageCode: initialData?.languageCode || navigator.language || "en",
      isFavorite: initialData?.isFavorite || false,
    },
  });

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
      url: data.url || "",
      originUrl: data.originUrl || "",
      siteName: data.siteName || "",
      languageCode: data.languageCode || "",
      isFavorite: data.isFavorite,
    });
  };

  const watchTopicId = watch("topicId");

  return (
    <form
      id={id}
      onSubmit={handleSubmit(onValidSubmit)}
      className="py-4 space-y-4"
    >
      <FieldGroup className="space-y-4">
        <Field data-invalid={!!errors.title}>
          <Label
            htmlFor="title"
            className={cn(
              "text-lg font-semibold",
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
            className="text-lg py-6"
          />
          {errors.title && <FieldError errors={[errors.title]} />}
        </Field>

        <Field data-invalid={!!errors.topicId}>
          <Label
            htmlFor="topicId"
            className={cn(
              "text-sm font-semibold",
              errors.topicId && "text-destructive",
            )}
          >
            Topic
          </Label>
          <Controller
            control={control}
            name="topicId"
            render={({ field }) => (
              <Combobox onOpenChange={() => {}}>
                <div className="relative w-full">
                  <ComboboxInput
                    placeholder="Search or select a topic..."
                    className="w-full"
                    aria-invalid={!!errors.topicId}
                  />
                </div>
                <ComboboxContent className="z-50 w-[--radix-popover-trigger-width]">
                  <ComboboxList>
                    {topics.length === 0 && (
                      <ComboboxEmpty>No topics found.</ComboboxEmpty>
                    )}
                    {topics.map((topic) => (
                      <ComboboxItem
                        key={topic.id}
                        value={topic.id}
                        onSelect={() => field.onChange(topic.id)}
                        className="m-1 max-w-[calc(100%-8px)]"
                      >
                        {topic.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
          {errors.topicId && <FieldError errors={[errors.topicId]} />}

          {/* Debug/Fallback representation of selected topic name */}
          {watchTopicId && topics.some((t) => t.id === watchTopicId) && (
            <div className="text-xs text-muted-foreground mt-1">
              Selected: {topics.find((t) => t.id === watchTopicId)?.name}
            </div>
          )}
        </Field>

        <Collapsible className="w-full space-y-2 pt-2">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex justify-between p-0 hover:bg-transparent"
            >
              <span className="text-sm font-medium text-muted-foreground">
                Additional metadata...
              </span>
              <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <Field data-invalid={!!errors.description}>
              <Label
                htmlFor="description"
                className={cn(errors.description && "text-destructive")}
              >
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="A brief description of this entry"
                rows={2}
                className="resize-y"
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && (
                <FieldError errors={[errors.description]} />
              )}
            </Field>

            <Field data-invalid={!!errors.tags}>
              <Label
                htmlFor="tags"
                className={cn(errors.tags && "text-destructive")}
              >
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                placeholder="e.g. documentation, context (max 10 allowed)"
                aria-invalid={!!errors.tags}
                {...register("tags")}
              />
              {errors.tags && <FieldError errors={[errors.tags]} />}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.siteName}>
                <Label
                  htmlFor="siteName"
                  className={cn(errors.siteName && "text-destructive")}
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

              <Field data-invalid={!!errors.languageCode}>
                <Label
                  htmlFor="languageCode"
                  className={cn(errors.languageCode && "text-destructive")}
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

            <Field data-invalid={!!errors.url}>
              <Label
                htmlFor="url"
                className={cn(errors.url && "text-destructive")}
              >
                URL
              </Label>
              <Input
                id="url"
                placeholder="e.g. https://example.com"
                aria-invalid={!!errors.url}
                {...register("url")}
              />
              {errors.url && <FieldError errors={[errors.url]} />}
            </Field>

            <Field data-invalid={!!errors.originUrl}>
              <Label
                htmlFor="originUrl"
                className={cn(errors.originUrl && "text-destructive")}
              >
                Origin URL
              </Label>
              <Input
                id="originUrl"
                placeholder="e.g. https://example.com/source"
                aria-invalid={!!errors.originUrl}
                {...register("originUrl")}
              />
              {errors.originUrl && <FieldError errors={[errors.originUrl]} />}
            </Field>

            <Field>
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
