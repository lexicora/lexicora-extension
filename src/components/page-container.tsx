import { cn } from "cn";

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
   * TODO: Use the existing provider for host detection instead of drilling this prop through every page
   * once more components need it — for now it is drilled as a prop.
   */
  isWindowed?: boolean;
  /**
   * Whether the container applies the page's horizontal gutter (12px on the
   * left, scrollbar-aware on the right). Pages with a block that must run edge
   * to edge pass `false` and wrap every other block in `.lc-page-gutter`
   * themselves; see the rule in App.css for the placement constraint.
   */
  gutter?: boolean;
}

export function PageContainer({
  children,
  id,
  idInner,
  className,
  classNameInner,
  isWindowed = false,
  gutter = true,
}: React.PropsWithChildren<PageContainerProps>) {
  return (
    <div
      id={id}
      data-windowed={isWindowed || undefined}
      data-gutter={gutter ? undefined : "false"}
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
