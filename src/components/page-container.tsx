import { cn } from "@/lib/utils";

interface PageContainerProps {
  /** The ID of the main container */
  id?: string;
  /** The ID of the inner container */
  idInner?: string;
  /** The CSS classes for the main container */
  className?: string;
  /** The CSS classes for the inner container */
  classNameInner?: string;
  /**
   * Which host the page is rendered in. Pages are side-panel-first, so this
   * defaults to `false` (side-panel) and the windowed entrypoint opts in by
   * passing `isWindowed`. Exposed as a `data-windowed` attribute so host-specific
   * styling can target `[data-windowed]` without forking the component.
   *
   * TODO: Migrate host detection to a context provider (e.g. AppMessagingProvider)
   * once more components need it — for now it is drilled as a prop.
   */
  isWindowed?: boolean;
}

export function PageContainer({
  children,
  id,
  idInner,
  className,
  classNameInner,
  isWindowed = false,
}: React.PropsWithChildren<PageContainerProps>) {
  return (
    <div
      id={id}
      data-windowed={isWindowed || undefined}
      className={cn("lc-page-container", className)}
    >
      <div
        id={idInner}
        className={cn("lc-page-container-inner", classNameInner)}
      >
        {children}
      </div>
    </div>
  );
}
