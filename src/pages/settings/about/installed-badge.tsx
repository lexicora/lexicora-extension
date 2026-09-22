import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

/**
 * Marks the release this build is. Tinted rather than grey: a neutral badge
 * sat too close to a list row's hover colour and all but disappeared.
 */
export function InstalledBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400",
        className,
      )}
    >
      Installed
    </Badge>
  );
}
