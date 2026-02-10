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
  roundingClass?: "" | "rounded-b-none" | "rounded-t-none" | "rounded-none!"; // TODO
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <div title={disabled && disabledReason ? disabledReason : ""}>
      <Item
        variant="muted"
        size={size}
        className={`group transition-colors duration-150 bg-slate-200/75 hover:bg-slate-300/75! dark:bg-muted/50 dark:hover:bg-muted! rounded-2xl ${roundingClass} ${disabled ? "opacity-65 grayscale-30 pointer-events-none" : ""}`}
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
            <ChevronRightIcon className="size-4 transition-colors duration-150 text-muted-foreground group-hover:text-(--lc-muted-foreground-hover)" />
          </ItemActions>
        </Link>
      </Item>
      {roundingClass !== "" && roundingClass !== "rounded-t-none" && (
        <SettingsItemSeperator />
      )}
    </div>
  );
}

export function SettingsItemSeperator() {
  return (
    <div className="flex flex-row">
      <div className="shrink-0 w-10.5 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
      <div className="flex-1 w-full h-0 max-w-[calc(100%-57px)] border-t border-t-[#c4cbd4] dark:border-t-[#2b3b52]"></div>
      <div className="shrink-0 w-3.75 h-0 border-t border-t-slate-200/75 dark:border-t-muted/50"></div>
    </div>
  );
}
