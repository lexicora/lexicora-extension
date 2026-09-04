import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";

import { FEATURES } from "@/constants/features";
import { cn } from "@/lib/utils";

interface AccountMenuProps {
  /** Extra classes for the avatar trigger, for host-specific tinting. */
  className?: string;
}

/**
 * Account avatar and menu, shared by the side-panel top bar and the popup.
 *
 * Renders nothing while `FEATURES.ACCOUNTS` is off, so accounts are decided in
 * exactly one place rather than at every call site. Callers should keep whatever
 * spacer element they use for layout — this returning `null` must not collapse
 * a header's alignment.
 */
export function AccountMenu({ className }: AccountMenuProps) {
  if (!FEATURES.ACCOUNTS) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="ml-0.5 size-8 shrink-0 rounded-md flex items-center">
          <div
            className={cn(
              "flex items-center justify-center size-full rounded-full ring ring-inset ring-black/20 dark:ring-white/20",
              className ?? "bg-secondary/50 dark:bg-secondary/75",
            )}
          >
            <UserIcon className="size-4.5" />
            {/* TODO: If logged in, show user's avatar or initials and also change the hue of the background to a color (user varying and users can choose)*/}
            {/* Maybe also just generate an image with an image generator */}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="select-none">
        <DropdownMenuLabel className="py-1">My Account</DropdownMenuLabel>
        <DropdownMenuItem className="py-1">Profile</DropdownMenuItem>
        <DropdownMenuItem className="py-1">Settings</DropdownMenuItem>
        {/*TODO: Maybe add "My Plan", "Subscription" or something like that, if we have a paid offering in the future */}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="py-1">Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="py-1">Sign out</DropdownMenuItem>
        {/*TODO: Make dynamic based on login status */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
