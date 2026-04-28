import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Field, FieldLabel } from "@/components/ui/field";

export interface TopicFormData {
  name: string;
  description: string;
  tags: string[];
  isFavorite: boolean;
}

interface TopicFormProps {
  initialData?: Partial<TopicFormData>;
  onSubmit: (data: TopicFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function TopicForm({
  initialData,
  onSubmit,
  isLoading = false,
}: TopicFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") || "",
  );
  const [isFavorite, setIsFavorite] = useState(
    initialData?.isFavorite || false,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10); // maxItems: 10

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      tags,
      isFavorite,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Topic Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="A brief description of this topic"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          placeholder="e.g. documentation, ideas, work"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        <span className="text-xs text-muted-foreground">
          Maximum of 10 tags allowed.
        </span>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="isFavorite"
          checked={isFavorite}
          onCheckedChange={setIsFavorite}
        />
        <Label htmlFor="isFavorite">Mark as Favorite</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Topic"}
      </Button>
    </form>
  );
}
