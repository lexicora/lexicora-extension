import { ArrowUpRightIcon } from "lucide-react";

import { FEATURES } from "@/constants/features";
import { WEBSITE_URL } from "@/constants/site";
import { cn } from "@/lib/utils";

interface WebsiteLinkProps {
  /** Applied to the wrapper, which is what carries the surrounding spacing. */
  className?: string;
  size?: "sm" | "xs";
}

/**
 * "Visit Lexicora.com", where the website is linked.
 *
 * Decides for itself, like `AccountMenu`: with `FEATURES.WEBSITE` off it
 * renders nothing at all — wrapper included, so no call site is left with a
 * gap where the link used to be.
 */
export function WebsiteLink({ className, size = "sm" }: WebsiteLinkProps) {
  if (!FEATURES.WEBSITE) return null;

  return (
    <div className={cn("flex justify-center", className)}>
      <a
        href={WEBSITE_URL}
        target="_blank"
        className={cn(
          "text-muted-foreground transition-all duration-100 hover:underline hover:underline-offset-2 hover:text-lc-muted-foreground-hover",
          size === "sm" ? "text-sm" : "text-xs",
        )}
        title={WEBSITE_URL}
      >
        Visit Lexicora.com{" "}
        <ArrowUpRightIcon className="inline" size={size === "sm" ? 16 : 13} />
      </a>
    </div>
  );
}
