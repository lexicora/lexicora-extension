import { ChevronRightIcon, HistoryIcon, PinIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";

interface HomeTopicsProps {
  topics: TopicDocType[];
  /** Shown when the list does not fill the space it was given. */
  showCreateLink: boolean;
}

/** Pinned and recent topics on the side-panel home page. */
export function HomeTopics({ topics, showCreateLink }: HomeTopicsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-1.75 mt-2 shrink-0">
      {topics.map((topic, index) => (
        <Button
          key={topic.id}
          variant="secondary"
          className={cn(
            "group w-full flex items-center h-9.5 gap-2 px-3 bg-card hover:bg-card-hover not-dark:shadow-xs rounded-xl text-left transition-colors",
            index === 0 && "mt-1.75",
          )}
          //title="View topic"
          onClick={() =>
            navigate(`/library/topics/${topic.id}`, { viewTransition: true })
          }
        >
          {topic.isPinned ? (
            <PinIcon className="size-3.5 text-blue-600 fill-blue-600 dark:text-blue-500 dark:fill-blue-500 shrink-0" />
          ) : (
            <HistoryIcon className="size-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm truncate flex-1">{topic.name}</span>
          <ChevronRightIcon className="transition-opacity size-3.5 text-muted-foreground shrink-0 opacity-70 group-hover:opacity-100" />
        </Button>
      ))}
      {showCreateLink && (
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate("/library/topics/new", { viewTransition: true })}
          className="self-center -mb-2"
        >
          Create a topic
        </Button>
      )}
    </div>
  );
}
