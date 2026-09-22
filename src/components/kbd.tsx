import { cn } from "cn";

/** A keycap. `muted` is for a key that is not bound, such as "Not set". */
export function Kbd({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md border bg-muted font-sans text-xs font-medium whitespace-nowrap",
        muted ? "text-muted-foreground italic" : "text-foreground",
      )}
    >
      {children}
    </kbd>
  );
}
