import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Toggle } from "@/components/ui/toggle";
import { getDb } from "@/db";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const createFormSchema = (currentTopicId?: string) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required.")
      .max(255, "Name is too long.")
      .refine(async (name) => {
        const db = await getDb();
        const existing = await db.topics
          .findOne({
            selector: {
              name: { $eq: name },
            },
          })
          .exec();

        // If topic exists and it's not the one we're currently editing
        if (existing && existing.id !== currentTopicId) {
          return false;
        }
        return true;
      }, "A topic with this name already exists."),
    tags: z.string().max(550, "Tags input is too long."), // we will split and validate individual tags later
    description: z
      .string()
      .trim()
      .max(1000, "Description is too long.")
      .optional()
      .or(z.literal("")),
    isFavorite: z.boolean(),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

export interface TopicFormData {
  name: string;
  description: string;
  tags: string[];
  isFavorite: boolean;
}

interface TopicFormProps {
  id?: string;
  initialData?: Partial<TopicFormData>;
  onSubmit: (data: TopicFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function TopicForm({
  id,
  initialData,
  onSubmit,
  isLoading,
}: TopicFormProps) {
  const schema = createFormSchema(id);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema), // Applying the dynamically generated zodResolver
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      tags: initialData?.tags?.join(", ") || "",
      isFavorite: initialData?.isFavorite || false,
    },
  });

  const currentDescription = watch("description") || "";

  const onValidSubmit = (data: FormValues) => {
    const tagsArray = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);

    onSubmit({
      name: data.name,
      description: data.description || "",
      tags: tagsArray,
      isFavorite: data.isFavorite,
    });
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmit(onValidSubmit)}
      className="pt-3.5 pb-0.5"
    >
      <FieldGroup>
        <Field data-invalid={!!errors.name} className="gap-2">
          <Label
            htmlFor="name"
            className={cn(
              "font-semibold ml-1",
              errors.name && "text-destructive",
            )}
          >
            Name
          </Label>
          <InputGroup>
            <InputGroupInput
              id="name"
              placeholder="Topic Name"
              aria-invalid={!!errors.name}
              {...register("name")}
              className="text-base!"
            />
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
          {errors.name && (
            <FieldError className="text-center" errors={[errors.name]} />
          )}
        </Field>

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
            placeholder="e.g. documentation, ideas (max 10 allowed)"
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
              placeholder="Description of this topic"
              rows={4}
              className="min-h-24 max-h-94 resize-none scrollbar-thin scrollbar-bg-transparent"
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
            <FieldError className="text-center" errors={[errors.description]} />
          )}
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner data-icon="inline-start" />}
            {isLoading ? "Saving..." : "Save Topic"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
