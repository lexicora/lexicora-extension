import styles from "./page-header.module.css";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollPos } from "@/providers/scroll-observer";
import { useAppHost } from "@/providers/app-host";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface ActionButtonConfig {
  iconSmall: React.ReactNode;
  iconLarge: React.ReactNode;
  // TODO: Potentially add loading icon and state here as well
  isLoading?: boolean;
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive";
  onClick?: () => void;
  title: string;
  type?: "button" | "submit" | "reset";
  form?: string;
}

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode; // Added children for custom UI
  hoverOnScroll?: boolean;
  headerTextAlignment?: "center" | "left";
  goBackButton?: boolean;
  goBackButtonVariant?: "ghost" | "tinted";
  goBackButtonTitle?: string;
  rightActionButton?: ActionButtonConfig;
  classNameHeaderElement?: string;
  heavyTeardown?: boolean;
}

/**
 * Windowed-only wrapper for the compact scroll strip. Reads the sidebar's
 * open/collapsed state directly so the left edge tracks the sidebar width via
 * JS-driven inline style — no CSS variable inheritance to fixed elements needed.
 * Only rendered in the windowed host (always inside SidebarProvider).
 */
function WindowedCompactStrip({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const { state, isMobile } = useSidebar();
  return (
    <div
      className={cn(className, "top-12.5 lc-strip-offset-container")}
      style={{
        left:
          !isMobile && state === "expanded" ? "var(--sidebar-width)" : "0px",
        right: 0,
        //transition: "left 200ms linear",
      }}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  children,
  hoverOnScroll = true,
  headerTextAlignment = "center",
  goBackButton = false,
  goBackButtonVariant = "ghost",
  goBackButtonTitle = "Go back",
  rightActionButton,
  classNameHeaderElement,
  heavyTeardown = false,
}: PageHeaderProps) {
  const { isAtTop } = useScrollPos();
  const { isWindowed } = useAppHost();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (heavyTeardown) {
      setTimeout(() => navigate(-1), 0);
    } else {
      navigate(-1);
    }
  };

  const isLeftAligned = headerTextAlignment === "left";

  const hoverAnimClasses = {
    hidden: "opacity-0! translate-y-3 blur-xs",
    visible: "opacity-100 translate-y-0 blur-0",
  };

  // CASE: Static Header (No Scroll Effects)
  if (!hoverOnScroll) {
    if (goBackButton) {
      return (
        <header
          className={cn(
            "flex items-center mb-4 w-full",
            classNameHeaderElement,
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            title={goBackButtonTitle}
            className={cn(
              "shrink-0 size-10 rounded-lg",
              goBackButtonVariant === "ghost" &&
                "hover:bg-gray-300 dark:hover:bg-gray-800",
              goBackButtonVariant === "tinted" &&
                "bg-gray-300 hover:bg-gray-400/60 dark:bg-gray-800/75 dark:hover:bg-gray-700/60 hover:text-secondary-foreground/95",
            )}
            onClick={handleGoBack}
            disabled={rightActionButton?.isLoading}
          >
            <ArrowLeftIcon className="size-5.5" />
          </Button>
          <h1
            className={cn(
              "text-2xl font-semibold",
              isLeftAligned
                ? "ml-3 text-left"
                : cn("flex-1 text-center", !rightActionButton && "mr-10"),
            )}
          >
            {title}
          </h1>
          {rightActionButton && (
            <Button
              form={rightActionButton.form}
              type={rightActionButton.type}
              variant={rightActionButton.variant || "default"}
              size="icon"
              title={rightActionButton.title}
              className={cn(
                "hover:ring-1 ring-inset ring-gray-300 dark:ring-gray-700",
                rightActionButton.variant === "default" &&
                  "bg-primary/80 hover:bg-primary hover:text-primary-foreground/95",
                rightActionButton.variant === "secondary" &&
                  "bg-secondary/80 hover:bg-secondary hover:text-secondary-foreground/95",
                // TODO: Other variants
                "shrink-0 size-10 rounded-lg",
              )}
              onClick={rightActionButton.onClick}
              disabled={rightActionButton.isLoading}
            >
              {rightActionButton.iconLarge}
            </Button>
          )}
          {/* Children rendered at the end of the flex container */}
          {children}
        </header>
      );
    }
    // Simple Static
    return (
      <header
        className={cn(
          "mb-4 mt-1", // (had:  flex items-center justify-between) Assuming you might want flex here if you pass children, but relying on your own classes
          classNameHeaderElement,
          isLeftAligned ? "text-left" : "text-center",
        )}
      >
        <h1 className="text-2xl font-semibold">{title}</h1>
        {/* Children rendered alongside the title */}
        {children}
      </header>
    );
  }

  // CASE: hoverOnScroll = true
  // The compact scroll strip inner content is the same regardless of host.
  // Only the outer wrapper differs (see below).
  const compactStripContent = goBackButton ? (
    <div
      className={cn(
        "flex mt-1.25 w-full /*max-w-317.25*/ max-w-[calc(var(--lc-content-max-width)+0.8125rem)] mr-(--lc-scrollbar-offset)",
        isWindowed && "lc-strip-offset",
        rightActionButton ? "justify-between" : "justify-start",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        title={goBackButtonTitle}
        className={cn(
          goBackButtonVariant === "ghost" &&
            "hover:bg-[color-mix(in_oklab,var(--color-gray-300),var(--color-gray-400)10%)] dark:hover:bg-[color-mix(in_oklab,var(--color-gray-800),var(--color-gray-700)10%)] hover:ring-1 ring-inset ring-gray-400/50 dark:ring-gray-700",
          goBackButtonVariant === "tinted" &&
            "backdrop-blur-sm hover:text-secondary-foreground/95 bg-gray-300/85 hover:bg-[color-mix(in_oklab,var(--color-gray-300),var(--color-gray-400)10%)] dark:bg-[color-mix(in_oklab,var(--color-gray-800),var(--color-gray-950)20%)] dark:hover:bg-[color-mix(in_oklab,var(--color-gray-800),var(--color-gray-700)10%)] ring-1 ring-inset ring-gray-400/30 hover:ring-gray-400/80 dark:ring-gray-700/35 dark:hover:ring-gray-700",
          "ml-3 shrink-0 size-7.5 transition-all duration-150 active-view-transition:transition-none",
          isAtTop ? hoverAnimClasses.hidden : hoverAnimClasses.visible,
        )}
        onClick={handleGoBack}
        disabled={rightActionButton?.isLoading}
      >
        <ArrowLeftIcon className="size-4.5" />
      </Button>
      <span
        // was 25px, now 1.5625em, max-w-298.5
        className={cn(
          "flex-1 mt-0.5 w-full /*max-w-298.5*/ max-w-[calc(var(--lc-content-max-width)-3.875rem)] text-base font-semibold transition-transform-opacity-blur duration-300 active-view-transition:transition-none text-center",
          !rightActionButton &&
            "mr-[calc(var(--lc-scrollbar-offset)+2.0625em)]",
          isWindowed && !rightActionButton && "lc-strip-offset",
          isAtTop ? hoverAnimClasses.hidden : hoverAnimClasses.visible,
        )}
      >
        {title}
      </span>
      {rightActionButton && (
        <Button
          form={rightActionButton.form}
          type={rightActionButton.type}
          variant={rightActionButton.variant || "default"}
          size="icon"
          title={rightActionButton.title}
          className={cn(
            "backdrop-blur-xs",
            rightActionButton.variant === "default" &&
              "bg-primary/80 hover:bg-primary hover:text-primary-foreground/95",
            rightActionButton.variant === "secondary" &&
              "bg-secondary/80 hover:bg-secondary hover:text-secondary-foreground/95 hover:ring-1 ring-inset ring-gray-300 dark:ring-gray-700",
            // TODO: Other variants
            "mr-0.75 shrink-0 size-7.5 transition-all duration-150 active-view-transition:transition-none",
            isAtTop ? hoverAnimClasses.hidden : hoverAnimClasses.visible,
          )}
          onClick={rightActionButton.onClick}
          disabled={rightActionButton.isLoading}
        >
          {rightActionButton.iconSmall}
        </Button>
      )}
    </div>
  ) : (
    <span
      className={cn(
        "ml-2.5 mr-(--lc-scrollbar-offset) mt-1.75 text-base font-semibold transition-transform-opacity-blur duration-300 active-view-transition:transition-none",
        isWindowed && "lc-strip-offset",
        isAtTop ? hoverAnimClasses.hidden : hoverAnimClasses.visible,
      )}
    >
      {title}
    </span>
  );

  // Base classes shared by both host variants (no top/left/width — those differ).
  const compactStripBase = cn(
    styles.styledBackground,
    "z-29 fixed h-11 pt-0 flex justify-center shrink-0",
    isAtTop ? styles.styledBackgroundNone : "",
  );

  return (
    <header
      className={cn(
        "flex flex-col w-full mb-4",
        classNameHeaderElement,
        isLeftAligned ? "text-left" : "text-center",
      )}
    >
      {/*
       * Compact scroll strip: anchored to the content area so it doesn't bleed
       * under the sidebar in the windowed host. Side-panel uses pure CSS (full
       * viewport, top below TopBar). Windowed uses a sub-component that reads
       * useSidebar() for an accurate JS-driven left offset + correct top value.
       */}
      {isWindowed ? (
        <WindowedCompactStrip className={compactStripBase}>
          {compactStripContent}
        </WindowedCompactStrip>
      ) : (
        <div className={cn(compactStripBase, "top-14.75 left-0 w-full")}>
          {compactStripContent}
        </div>
      )}

      {goBackButton ? (
        // Large Title: WITH Back Button
        <div
          className={cn(
            "flex items-center will-change-opacity transition-opacity duration-300",
            isAtTop ? "opacity-100" : "opacity-0 duration-50",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            title={goBackButtonTitle}
            className={cn(
              "shrink-0 size-10 rounded-lg",
              goBackButtonVariant === "ghost" &&
                "hover:bg-gray-300 dark:hover:bg-gray-800",
              goBackButtonVariant === "tinted" &&
                "bg-gray-300 hover:bg-gray-400/60 dark:bg-gray-800/75 dark:hover:bg-gray-700/70 hover:text-secondary-foreground/95",
            )}
            onClick={handleGoBack}
            disabled={rightActionButton?.isLoading}
          >
            <ArrowLeftIcon className="size-5.5" />
          </Button>
          <h1
            className={cn(
              "text-2xl font-semibold",
              isLeftAligned
                ? "ml-3 text-left"
                : cn("flex-1 text-center", !rightActionButton && "mr-10"),
            )}
          >
            {title}
          </h1>
          {rightActionButton && (
            <Button
              form={rightActionButton.form}
              type={rightActionButton.type}
              variant={rightActionButton.variant || "default"}
              size="icon"
              title={rightActionButton.title}
              className={cn(
                rightActionButton.variant === "default" &&
                  "bg-primary/80 hover:bg-primary hover:text-primary-foreground/95",
                // TODO: Other variants
                "shrink-0 size-10 rounded-lg",
              )}
              onClick={rightActionButton.onClick}
              disabled={rightActionButton.isLoading}
            >
              {rightActionButton.iconLarge}
            </Button>
          )}
        </div>
      ) : (
        // Large Title: SIMPLE, had css classes:  flex items-center justify-between
        <div className="mt-1">
          <h1
            className={cn(
              "text-2xl font-semibold will-change-opacity transition-opacity duration-300",
              isAtTop ? "opacity-100" : "opacity-0 duration-50",
              isLeftAligned ? "text-left" : "text-center",
            )}
          >
            {title}
          </h1>
        </div>
      )}
      {/* Children rendered next to the simple title */}
      {children}
    </header>
  );
}
