import styles from "./page-header.module.css";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollPos } from "@/entrypoints/sidepanel/providers/scroll-observer";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  hoverOnScroll?: boolean;
  headerTextAlignment?: "center" | "left";
  goBackButton?: boolean;
  classNameHeaderElement?: string;
}

export function PageHeader({
  title,
  hoverOnScroll = true,
  headerTextAlignment = "center",
  goBackButton = false,
  classNameHeaderElement,
}: PageHeaderProps) {
  const { isAtTop } = useScrollPos();
  const navigate = useNavigate();

  const handleGoBack = () => navigate(-1);
  const isLeftAligned = headerTextAlignment === "left";

  // Shared animation classes for hover elements
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
        </header>
      );
    }
    // Simple Static
    return (
      <header
        className={cn(
          "mb-4 mt-1",
          classNameHeaderElement,
          isLeftAligned ? "text-left" : "text-center",
        )}
      >
        <h1 className="text-2xl font-semibold">{title}</h1>
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
          // Hover Content: WITH Back Button
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
              className={cn(
                "mr-[calc(var(--lc-scrollbar-offset)+24px)] mt-0.5 w-full text-base font-semibold transition-all duration-300 active-view-transition:transition-none text-center",
                isAtTop ? hoverAnimClasses.hidden : hoverAnimClasses.visible,
              )}
            >
              {title}
            </span>
          </div>
        ) : (
          // Hover Content: SIMPLE (No Back Button)
          <span
            className={cn(
              "ml-2.5 mr-(--lc-scrollbar-offset) mt-1.75 text-base font-semibold transition-all duration-300 active-view-transition:transition-none",
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
            "flex items-center transition-opacity duration-300",
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
        // Large Title: SIMPLE
        <div className="mt-1">
          <h1
            className={cn(
              "text-2xl font-semibold transition-opacity duration-300",
              isAtTop ? "opacity-100" : "opacity-0 duration-50",
              isLeftAligned ? "text-left" : "text-center",
            )}
          >
            {title}
          </h1>
        </div>
      )}
    </header>
  );
}
