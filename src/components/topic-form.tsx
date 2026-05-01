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
import { StarIcon } from "lucide-react";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Topic name must be at least 5 characters.")
    .max(50, "Topic name must be less than 50 characters."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  tags: z.string(),
  isFavorite: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

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

export function TopicForm({ id, initialData, onSubmit }: TopicFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Applying the zodResolver
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      tags: initialData?.tags?.join(", ") || "",
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
      name: data.name,
      description: data.description || "",
      tags: tagsArray,
      isFavorite: data.isFavorite,
    });
  };

  return (
    <form id={id} onSubmit={handleSubmit(onValidSubmit)} className="py-4">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <Label
            htmlFor="name"
            className={cn(errors.name && "text-destructive")}
          >
            Name
          </Label>
          <Input
            id="name"
            placeholder="Topic Name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <FieldError errors={[errors.name]} />}
        </Field>

        <Field data-invalid={!!errors.description}>
          <Label
            htmlFor="description"
            className={cn(errors.description && "text-destructive")}
          >
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="A brief description of this topic"
            rows={3}
            className="resize-none"
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldDescription>
            A short paragraph describing what this topic is about.
          </FieldDescription>
          {errors.description && <FieldError errors={[errors.description]} />}
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
            placeholder="e.g. documentation, ideas, work"
            aria-invalid={!!errors.tags}
            {...register("tags")}
          />
          <FieldDescription>Maximum of 10 tags allowed.</FieldDescription>
          {errors.tags && <FieldError errors={[errors.tags]} />}
        </Field>
        <Field>
          <div className="flex items-center justify-center">
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
      </FieldGroup>
    </form>
  );
}
