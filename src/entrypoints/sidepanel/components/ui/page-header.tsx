import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollPos } from "@/entrypoints/sidepanel/providers/scroll-observer";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  hoverOnScroll = true,
  headerTextAlignment = "center",
  goBackButton = false,
}: {
  title: string;
  hoverOnScroll?: boolean;
  headerTextAlignment?: "center" | "left";
  goBackButton?: boolean;
}) {
  const { isAtTop } = useScrollPos();
  const navigate = useNavigate();

  const handleGoBack = () => navigate(-1);

  // CASE: Static Header (No Scroll Effects)
  if (!hoverOnScroll) {
    if (goBackButton) {
      return (
        <header className="flex items-center mb-4 w-full">
          <Button
            variant="ghost"
            size="icon"
            title="Go back"
            className="shrink-0 size-10 rounded-lg"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon className="size-4.5" />
          </Button>
          <h1 className="flex-1 mr-10 text-2xl font-semibold">{title}</h1>
        </header>
      );
    }
    // Simple Static
    return (
      <header className={`mb-4 mt-1 text-${headerTextAlignment}`}>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </header>
    );
  }

  const stickyAnimClasses = {
    hidden: "opacity-0 translate-y-3 blur-xs",
    visible: "opacity-100 translate-y-0 blur-0",
  };

  return (
    <header
      className={cn("flex flex-col w-full mb-4", `text-${headerTextAlignment}`)}
    >
      {/* --- STICKY TOP BAR --- */}
      <div
        className={cn(
          "lc-page-title-styled-bg z-29 fixed top-14.75 left-0 w-full h-11 pt-0 flex justify-center shrink-0 /*transition-none*/",
          isAtTop ? "lc-page-title-styled-bg-none pointer-events-none" : "",
        )}
      >
        {goBackButton ? (
          // Sticky Content: WITH Back Button
          <div className="flex mt-1.25 w-full">
            <Button
              variant="ghost"
              size="icon"
              title="Go back"
              className={cn(
                "not-dark:hover:bg-gray-200/75",
                "ml-1.75 shrink-0 size-7 transition-all duration-150 active-view-transition:transition-none",
                isAtTop ? stickyAnimClasses.hidden : stickyAnimClasses.visible,
              )}
              onClick={handleGoBack}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <span
              className={cn(
                "mr-5.75 mt-0.5 w-full text-base font-semibold transition-all duration-300 active-view-transition:transition-none",
                isAtTop ? stickyAnimClasses.hidden : stickyAnimClasses.visible,
              )}
            >
              {title}
            </span>
          </div>
        ) : (
          // Sticky Content: SIMPLE (No Back Button)
          <span
            className={cn(
              "pl-3 pt-1.75 text-base font-semibold transition-all duration-300 active-view-transition:transition-none",
              isAtTop ? stickyAnimClasses.hidden : stickyAnimClasses.visible,
            )}
          >
            {title}
          </span>
        )}
      </div>

      {goBackButton ? (
        // Large Title: WITH Back Button
        // Note: The outer div handles the opacity transition for the whole group
        <div
          className={cn(
            "flex items-center transition-opacity duration-300",
            isAtTop ? "opacity-100" : "opacity-0",
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
          <h1 className="text-2xl font-semibold w-full mr-10">{title}</h1>
        </div>
      ) : (
        // Large Title: SIMPLE
        <div className="mt-4">
          <h1
            className={cn(
              "text-2xl font-semibold transition-opacity duration-300",
              isAtTop ? "opacity-100" : "opacity-0",
            )}
          >
            {title}
          </h1>
        </div>
      )}
    </header>
  );
}
