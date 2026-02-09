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
  if (!hoverOnScroll && !goBackButton) {
    return (
      <header className={`mb-4 mt-1 text-${headerTextAlignment}`}>
        <h1 className="text-2xl font-semibold">Entries</h1>
      </header>
    );
  }

  if (!hoverOnScroll && goBackButton) {
    const navigate = useNavigate();
    return (
      <header className="flex items-center mb-4 w-full">
        <Button
          variant="ghost"
          size="icon"
          title="Go back"
          className="shrink-0 size-10 rounded-lg"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="size-4.5" />
        </Button>
        <h1 className="flex-1 mr-10 text-2xl font-semibold">{title}</h1>
      </header>
    );
  }

  const { isAtTop } = useScrollPos();

  if (hoverOnScroll && !goBackButton) {
    return (
      <header
        className={`flex flex-col w-full mb-4 text-${headerTextAlignment}`}
      >
        {/*Sticky Navigation Bar (Small Title) (maybe make a bit taller)*/}
        <div
          className={cn(
            "lc-page-title-styled-bg z-29 fixed top-14.75 left-0 w-full h-11 pt-0 flex /*items-center*/ justify-center shrink-0",
            isAtTop ? "lc-page-title-styled-bg-none" : "",
          )}
        >
          <span
            className={cn(
              "pl-3 pt-1.75 text-base font-semibold transition-all duration-300 active-view-transition:transition-none /*active-view-transition:duration-200*/",
              {
                "opacity-0 translate-y-3 blur-xs": isAtTop,
                "opacity-100 translate-y-0 blur-0": !isAtTop,
              },
            )}
          >
            {title}
          </span>
        </div>

        {/*Large Title*/}
        <div className="mt-4">
          <h1
            className={cn(
              "text-2xl font-semibold transition-opacity duration-300",
              isAtTop ? "opacity-100" : "opacity-0" /*tracking-tight*/,
            )}
          >
            {title}
          </h1>
        </div>
      </header>
    );
  }

  const navigate = useNavigate();

  if (goBackButton) {
    // For now, just render the back button without the hover effect, as the hover effect is more complex to implement with the back button (need to consider the placement and spacing of the back button and title, and how they interact with the hover effect)
    return (
      <header className="flex flex-col w-full mb-4">
        {/*Sticky Navigation Bar (Small Title) (maybe make a bit taller)*/}
        <div
          className={cn(
            "lc-page-title-styled-bg z-29 fixed top-14.75 left-0 w-full h-11 pt-0 flex /*items-center*/ justify-center shrink-0",
            isAtTop ? "lc-page-title-styled-bg-none" : "",
          )}
        >
          <div className="flex mt-1.25 w-full">
            <Button
              variant="ghost"
              size="icon"
              title="Go back"
              className={cn(
                "not-dark:hover:bg-gray-200/75",
                "ml-1.75 shrink-0 size-7 transition-all duration-150 active-view-transition:transition-none",
                {
                  "opacity-0 translate-y-3 blur-xs": isAtTop,
                  "opacity-100 translate-y-0 blur-0": !isAtTop,
                },
              )}
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <span
              className={cn(
                "mr-5.75 mt-0.5 w-full text-base font-semibold transition-all duration-300 active-view-transition:transition-none /*active-view-transition:duration-200*/",
                {
                  "opacity-0 translate-y-3 blur-xs": isAtTop,
                  "opacity-100 translate-y-0 blur-0": !isAtTop,
                },
              )}
            >
              {title}
            </span>
          </div>
        </div>

        {/*Large Title*/}
        <div
          className={cn(
            "flex items-center mt-0 transition-opacity duration-300",
            isAtTop ? "opacity-100" : "opacity-0",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            title="Go back"
            className="shrink-0 size-10 rounded-lg"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="size-4.5" />
          </Button>
          <h1 className="text-2xl font-semibold w-full mr-10">{title}</h1>
        </div>
      </header>
    );
  }
}
