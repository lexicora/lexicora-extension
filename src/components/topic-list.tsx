import * as Avatar from "@radix-ui/react-avatar";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemMedia,
} from "@/components/ui/item";

import { useNavigate } from "react-router-dom";
import { StarIcon } from "lucide-react";
import { TopicDocType } from "@/db/schemas/topic";
import { useState, useEffect } from "react";
import { getDb } from "@/db";
import { Virtuoso } from "react-virtuoso";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TopicItemProps {
  topic: TopicDocType;
  // potentially more fields, like author, tags, etc.
}

export function TopicItem({ topic }: TopicItemProps) {
  const navigate = useNavigate();

  // Format the date using the modern Temporal API (with a standard Date fallback).
  // We use `updatedAt` because library items are typically sorted and searched by recent activity.
  const formattedDate = (() => {
    try {
      // @ts-ignore - TS might not have Temporal types inherently available yet.
      const instant = Temporal.Instant.from(topic.updatedAt);
      return instant.toLocaleString(navigator.language, {
        dateStyle: "medium", // 'medium' is usually nicely balanced (e.g. Oct 18, 2026)
        timeStyle: "short",
      });
    } catch (e) {
      // Safe fallback if Temporal throws/isn't supported
      return new Date(topic.updatedAt).toLocaleString(navigator.language, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  })();

  return (
    <Item key={topic.id} variant="outline" asChild>
      <Button
        variant="ghost"
        className="h-full rounded-lg"
        onClick={() => navigate(`/library/topics/${topic.id}`)}
      >
        <ItemContent>
          <ItemTitle className="line-clamp-1">
            {topic.name}
            {/* -{" "}
            <span className="text-muted-foreground">{formattedDate}</span> */}
          </ItemTitle>
          {/* <ItemDescription>
            {topic.entryCount} {topic.entryCount === 1 ? "entry" : "entries"}
          </ItemDescription> */}
          <ItemDescription className="truncate max-w-[50%]">
            {topic.description || "-"}
          </ItemDescription>
        </ItemContent>
        <ItemContent className="flex-col justify-between items-end">
          <div className="flex justify-end">
            <StarIcon
              className={cn(
                "size-4",
                topic.isFavorite
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-400",
              )}
            />
          </div>
          <ItemDescription className="text-xs text-muted-foreground whitespace-nowrap">
            {formattedDate}
          </ItemDescription>
        </ItemContent>
      </Button>
    </Item>
  );
}

interface TopicListProps {
  search: string;
  onlyFavorites: boolean;
}

export function TopicList({ search, onlyFavorites }: TopicListProps) {
  const [topics, setTopics] = useState<TopicDocType[]>([]);
  const [limit, setLimit] = useState(50);

  // Reset limit when search or filters change
  useEffect(() => {
    setLimit(50);
  }, [search, onlyFavorites]);

  useEffect(() => {
    let sub: any;

    const fetchTopics = async () => {
      const db = await getDb();
      if (!db) return;

      const selector: any = {};
      if (onlyFavorites) {
        selector.isFavorite = true;
      }

      if (search.trim()) {
        // Simple regex matching on name
        selector.name = { $regex: new RegExp(search, "i") };
      }

      const query = db.collections.topics.find({
        selector,
        sort: [{ updatedAt: "desc" }],
        limit: limit,
      });

      sub = query.$.subscribe((results) => {
        setTopics(results as TopicDocType[]);
      });
    };

    fetchTopics();

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [search, onlyFavorites, limit]);

  return (
    <Virtuoso
      useWindowScroll
      data={topics}
      endReached={() => setLimit((prev) => prev + 50)}
      itemContent={(_, topic) => (
        <div className="px-1.5 py-1.5">
          <TopicItem topic={topic} />
        </div>
      )}
    />
  );
}
