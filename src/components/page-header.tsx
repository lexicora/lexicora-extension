import styles from "./page-header.module.css";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollPos } from "@/providers/scroll-observer";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode; // Added children for custom UI
  hoverOnScroll?: boolean;
  headerTextAlignment?: "center" | "left";
  goBackButton?: boolean;
  classNameHeaderElement?: string;
  heavyTeardown?: boolean;
}

export function PageHeader({
  title,
  children,
  hoverOnScroll = true,
  headerTextAlignment = "center",
  goBackButton = false,
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
    hidden: "opacity-0 translate-y-3 blur-xs",
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
            className="shrink-0 size-10 rounded-lg"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon className="size-4.5" />
          </Button>
          <h1
            className={cn(
              "text-2xl font-semibold",
              isLeftAligned ? "ml-3 text-left" : "flex-1 text-center mr-10",
            )}
          >
            {title}
          </h1>
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
          <div className="flex mt-1.25 w-full">
            <Button
              variant="ghost"
              size="icon"
              title="Go back"
              className={cn(
                "hover:bg-gray-200 dark:hover:bg-gray-800",
                "ml-1.75 shrink-0 size-7 transition-all duration-150 active-view-transition:transition-none",
                isAtTop ? hoverAnimClasses.hidden : hoverAnimClasses.visible,
              )}
              onClick={handleGoBack}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <span
              // was 25px, now 1.5625em
              className={cn(
                "mr-[calc(var(--lc-scrollbar-offset)+1.5625em)] mt-0.5 w-full text-base font-semibold transition-transform-opacity-blur duration-300 active-view-transition:transition-none text-center",
                isAtTop ? hoverAnimClasses.hidden : hoverAnimClasses.visible,
              )}
            >
              {title}
            </span>
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
            className="shrink-0 size-10 rounded-lg"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon className="size-4.5" />
          </Button>
          <h1
            className={cn(
              "text-2xl font-semibold",
              isLeftAligned ? "ml-3 text-left" : "w-full text-center mr-10",
            )}
          >
            {title}
          </h1>
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
