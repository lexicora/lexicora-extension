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
}

export function PageContainer({
  children,
  id,
  idInner,
  className,
  classNameInner,
}: React.PropsWithChildren<PageContainerProps>) {
  return (
    <div id={id} className={cn("lc-page-container", className)}>
      <div
        id={idInner}
        className={cn("lc-page-container-inner", classNameInner)}
      >
        {children}
      </div>
    </div>
  );
}
