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

  return (
    <Item key={topic.id} variant="outline" asChild>
      <Button
        variant="ghost"
        className="h-full rounded-lg"
        onClick={() => navigate(`/library/topics/${topic.id}`)}
      >
        <ItemContent>
          <ItemTitle>{topic.name}</ItemTitle>
          {/* <ItemDescription>
            {topic.entryCount} {topic.entryCount === 1 ? "entry" : "entries"}
          </ItemDescription> */}
          {/* <ItemDescription>{topic.description.substring(0, 20)}...</ItemDescription> */}
        </ItemContent>
        <ItemContent className="flex-col justify-between">
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
          <ItemDescription>{topic.updatedAt}</ItemDescription>
        </ItemContent>
      </Button>
    </Item>
  );
}

// export function TopicList() {
//     return ();
// }

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
        <div className="px-2 py-1.5">
          <TopicItem topic={topic} />
        </div>
      )}
    />
  );
}
