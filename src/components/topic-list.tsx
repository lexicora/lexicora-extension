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

export type TopicItemObject = {
  id: string;
  name: string;
  description: string;
  //createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isFavorite: boolean;
  //entryCount?: number;
};

interface TopicItemProps {
  topic: TopicItemObject;
  displayFavicon?: boolean;
  // potentially more fields, like author, tags, etc.
}

export function TopicItem({ topic, displayFavicon }: TopicItemProps) {
  const navigate = useNavigate();

  return (
    <Item key={topic.id} variant="outline" asChild>
      <button onClick={() => navigate(`/library/topics/${topic.id}`)}>
        <ItemContent>
          <ItemTitle>{topic.name}</ItemTitle>
          {/* <ItemDescription>
            {topic.entryCount} {topic.entryCount === 1 ? "entry" : "entries"}
          </ItemDescription> */}
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
