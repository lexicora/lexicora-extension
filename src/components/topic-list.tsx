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

export type TopicItem = {
  id: string;
  name: string;
  description: string;
  //createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isFavorite: boolean;
  entryCount: number;
  faviconUrl?: string;
};

interface TopicItemProps {
  topic: TopicItem;
  displayFavicon?: boolean;
  // potentially more fields, like author, tags, etc.
}

export function TopicItem({ topic, displayFavicon }: TopicItemProps) {
  const navigate = useNavigate();

  return (
    <Item key={topic.id} variant="outline" asChild>
      <button onClick={() => navigate(`/library/topics/${topic.id}`)}>
        {displayFavicon && (
          <ItemMedia variant="icon">
            <Avatar.Root className="flex shrink-0 /*size-8.5*/ size-full my-px">
              <Avatar.Image
                className="rounded-md"
                src={topic.faviconUrl || undefined}
                alt="Favicon"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNlZWVlZWUiIHJ4PSIyIiByeT0iMiIvPjwvc3ZnPg==";
                }}
              />
              <Avatar.Fallback delayMs={500}>
                <div className="bg-gray-200 dark:bg-gray-800 /*size-8.5*/ size-full rounded-md"></div>
              </Avatar.Fallback>
            </Avatar.Root>
          </ItemMedia>
        )}
        <ItemContent>
          <ItemTitle>{topic.name}</ItemTitle>
          <ItemDescription>
            {topic.entryCount} {topic.entryCount === 1 ? "entry" : "entries"}
          </ItemDescription>
          {/* <ItemDescription>{topic.description.substring(0, 20)}...</ItemDescription> */}
        </ItemContent>
        <ItemContent className="flex-col justify-between">
          <StarIcon
            className={`size-4 ${topic.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`}
          />
          <ItemDescription>{topic.updatedAt}</ItemDescription>
        </ItemContent>
      </button>
    </Item>
  );
}

// export function TopicList() {
//     return ();
// }
