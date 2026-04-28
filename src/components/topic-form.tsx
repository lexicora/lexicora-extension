import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldGroup,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Topic name must be at least 5 characters.")
    .max(50, "Topic name must be less than 50 characters."),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(500)
    .optional()
    .or(z.literal("")),
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

function FavoriteToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex w-fit items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md border",
        value
          ? "bg-primary/5 border-primary/30 text-primary hover:bg-primary/10 dark:bg-primary/10 dark:border-primary/20"
          : "bg-transparent border-input hover:bg-accent hover:text-accent-foreground text-muted-foreground",
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={value ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("w-5 h-5", value && "text-yellow-500 fill-yellow-500")}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {value ? "Favorited" : "Mark as Favorite"}
    </button>
  );
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
          <Controller
            control={control}
            name="isFavorite"
            render={({ field }) => (
              <FavoriteToggle value={field.value} onChange={field.onChange} />
            )}
          />
        </Field>
      </FieldGroup>
    </form>
  );
}
