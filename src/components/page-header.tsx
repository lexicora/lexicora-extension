import styles from "./page-header.module.css";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollPos } from "@/providers/scroll-observer";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";

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
  rightActionButton?: ActionButtonConfig;
  classNameHeaderElement?: string;
  heavyTeardown?: boolean;
}

export function PageHeader({
  title,
  children,
  hoverOnScroll = true,
  headerTextAlignment = "center",
  goBackButton = false,
  rightActionButton,
  classNameHeaderElement,
  heavyTeardown = false,
}: PageHeaderProps) {
  const { isAtTop } = useScrollPos();
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
            title="Go back"
            className="shrink-0 size-10 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
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
              {rightActionButton.isLoading ? (
                <Spinner data-icon="inline-start" className="size-5.5" />
              ) : (
                rightActionButton.iconLarge
              )}
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

  return (
    <header
      className={cn(
        "flex flex-col w-full mb-4",
        classNameHeaderElement,
        isLeftAligned ? "text-left" : "text-center",
      )}
    >
      <div
        className={cn(
          styles.styledBackground,
          "z-29 fixed top-14.75 left-0 w-full h-11 pt-0 flex justify-center shrink-0",
          isAtTop ? styles.styledBackgroundNone : "",
        )}
      >
        {goBackButton ? (
          <div
            //className="flex mt-1.25 w-full max-w-317.25 relative"
            className={cn(
              "flex mt-1.25 w-full max-w-317.25 mr-(--lc-scrollbar-offset)",
              rightActionButton ? "justify-between" : "justify-start",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              title="Go back"
              className={cn(
                "hover:bg-gray-200 dark:hover:bg-gray-800 hover:ring-1 ring-inset ring-gray-300 dark:ring-gray-700",
                "ml-3 shrink-0 size-7.5 transition-all duration-150 active-view-transition:transition-none",
                isAtTop ? hoverAnimClasses.hidden : hoverAnimClasses.visible,
              )}
              onClick={handleGoBack}
              disabled={rightActionButton?.isLoading}
            >
              <ArrowLeftIcon className="size-4.5" />
            </Button>
            <span
              // was 25px, now 1.5625em
              className={cn(
                "flex-1 mt-0.5 w-full max-w-298.5 text-base font-semibold transition-transform-opacity-blur duration-300 active-view-transition:transition-none text-center",
                !rightActionButton &&
                  "mr-[calc(var(--lc-scrollbar-offset)+2.0625em)]",
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
                {rightActionButton.isLoading ? (
                  <Spinner className="size-4.5" />
                ) : (
                  rightActionButton.iconSmall
                )}
              </Button>
            )}
          </div>
        ) : (
          <span
            className={cn(
              "ml-2.5 mr-(--lc-scrollbar-offset) mt-1.75 text-base font-semibold transition-transform-opacity-blur duration-300 active-view-transition:transition-none",
              isAtTop ? hoverAnimClasses.hidden : hoverAnimClasses.visible,
            )}
          >
            {title}
          </span>
        )}
      </div>

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
            title="Go back"
            className="shrink-0 size-10 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
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
              {rightActionButton.isLoading ? (
                <Spinner className="size-5.5" />
              ) : (
                rightActionButton.iconLarge
              )}
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
