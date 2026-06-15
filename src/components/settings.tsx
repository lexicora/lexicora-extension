import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "react-router-dom";
import {
  ChevronRightIcon,
  SquareDashedIcon as PlaceHolderIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Use this in the settings index page to render each settings item
 * @param
 * @returns settings item component
 */
export function SettingsItem({
  to,
  size = "default",
  MediaIcon = PlaceHolderIcon,
  mediaIconColor = "text-gray-500",
  itemTitle = "Settings Item",
  roundingClass = "",
  disabled = false,
  disabledReason = "",
}: {
  to: string;
  size: "default" | "sm" | "xs";
  MediaIcon?: typeof PlaceHolderIcon;
  mediaIconColor?: string;
  itemTitle?: string;
  roundingClass?: "" | "rounded-b-none" | "rounded-t-none" | "rounded-none!";
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <div title={disabled && disabledReason ? disabledReason : ""}>
      <Item
        variant="muted"
        size={size}
        className={cn(
          "group transition-colors duration-150 bg-card hover:bg-card-hover! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl",
          roundingClass,
          { "opacity-65 grayscale-30 pointer-events-none": disabled },
          //disabled && "opacity-65 grayscale-30 pointer-events-none", (works the same as above)
        )}
        tabIndex={disabled ? -1 : 0}
        asChild
      >
        <Link to={to} draggable={false} viewTransition>
          <ItemMedia variant="icon">
            <MediaIcon className={`size-5 ${mediaIconColor}`} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{itemTitle}</ItemTitle>
            {/*<ItemDescription>
          Customize the appearance and behavior of the extension.
        </ItemDescription>*/}
          </ItemContent>
          <ItemActions>
            {/*For external links change to the ExternalLinkIcon */}
            <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-lc-muted-foreground-hover" />
          </ItemActions>
        </Link>
      </Item>
      {roundingClass !== "" && roundingClass !== "rounded-t-none" && (
        <SettingsItemSeparator />
      )}
    </div>
  );
}

export function SettingsItemSeparator({
  symmetric = false,
}: {
  symmetric?: boolean;
}) {
  return (
    <div className="flex flex-row">
      <div
        className={cn(
          "shrink-0 w-10.5 h-0 border-t border-t-card dark:border-t-muted/50",
          symmetric && "w-3.75",
        )}
      ></div>
      <div
        className={cn(
          "flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-[#d0d8e1] dark:border-t-[#2b3b52]",
          symmetric && "max-w-[calc(100%-30px)]",
        )}
      ></div>
      <div className="shrink-0 w-3.75 h-0 border-t border-t-card dark:border-t-muted/50"></div>
    </div>
  );
}
