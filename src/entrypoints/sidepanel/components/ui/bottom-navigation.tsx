import "./bottom-navigation.css";
import {
  //HomeIcon, //Home page
  RectangleStackIcon, // TODO: maybe switch to this later (for Entries page)
  Cog6ToothIcon, //Settings page
} from "@heroicons/react/24/outline";
import { HomeIconOutline as CustomHeroHomeIcon } from "@/components/icons/custom-heroicons"; //(Custom icon) Home page
import {
  HomeIcon as HomeIconSolid, //Home page (solid)
  RectangleStackIcon as RectangleStackIconSolid, // TODO: maybe switch to this later (for Entries page)
  Cog6ToothIcon as Cog6ToothIconSolid, //Settings page
} from "@heroicons/react/24/solid";
import {
  StretchHorizontalIcon,
  GalleryVerticalEndIcon, //same as RectangleStackIcon, but from lucide-react
} from "lucide-react"; //Candidate for Entries page 5 (solid)
import { NavLink, useLocation, matchPath } from "react-router-dom";

import { useScrollPos } from "../../providers/scroll-observer";

export function BottomNavigation() {
  const { pathname } = useLocation();
  const { isAtBottom } = useScrollPos();

  const hiddenPatterns = [
    "entries/new",
    "/entries/:id/edit", // Matches /entries/123/edit
  ];

  // Check if current path matches any of our hidden patterns
  const isHidden = hiddenPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname),
  );

  const noShadowPaths = ["/"];

  // Determine if the current path is in the noShadowPaths array
  const isNoShadowPath = noShadowPaths.includes(pathname);

  //* NOTE: Every page that opts in to the bottom navigation should provide its own margin at the bottom
  return (
    <section
      id="lc-bottom-navigation-item"
      // Change px-2.75 to px-2.5 if four items are present
      className={`lc-bottom-navigation
          fixed bottom-0 w-full h-14.75 px-2.75 pr-[calc(var(--lc-scrollbar-offset)+1px)] z-100 select-none
          border-t bg-background/80 backdrop-blur-lg
          ${
            isHidden
              ? "lc-bottom-navigation--hidden"
              : isNoShadowPath
                ? "shadow-none"
                : isAtBottom
                  ? "shadow-none"
                  : "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)]/4 dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)]/26"
          }
          `}
    >
      <div
        className="flex items-center justify-between text-center w-full max-w-317 h-full /*max-w-7xl*/ mx-auto inset-x-0"
        // had classes: lc-bottom-navigation-animate-blur ${isHidden ? "lc-bottom-navigation-animate-blur--hidden" : ""}
      >
        {/*ml-2.5 for the outer most link (left) (change, when four items are present)*/}
        <div className="flex-1 mx-3 ml-2.5 /*ml-0.5*/ flex items-center justify-center h-full">
          {/* Home */}
          <NavLink
            to="/"
            title={pathname !== "/" ? "Home" : ""}
            draggable={false}
            viewTransition={pathname === "/" ? false : true}
            className="group flex flex-col items-center py-4 w-full"
          >
            {({ isActive }) => (
              <div
                className={`transition-all duration-200 will-change-transform ${isActive ? "scale-100" : "text-muted-foreground group-hover:scale-110 group-hover:text-(--lc-muted-foreground-hover)"}`}
              >
                {isActive ? (
                  <HomeIconSolid className="size-6.5 animate-icon-pop" />
                ) : (
                  <CustomHeroHomeIcon className="size-6.5" />
                )}
              </div>
            )}
          </NavLink>
        </div>
        <div className="flex-1 mx-3 flex items-center justify-center h-full">
          {/* Entries */}
          <NavLink
            to="/entries"
            title={pathname.startsWith("/entries") ? "" : "Entries"}
            draggable={false}
            viewTransition={pathname === "/entries" ? false : true}
            className="group flex flex-col items-center py-4 w-full"
          >
            {({ isActive }) => (
              <div
                className={`transition-all duration-200 will-change-transform ${isActive ? "scale-100" : "text-muted-foreground group-hover:scale-110 group-hover:text-(--lc-muted-foreground-hover)"}`}
              >
                <StretchHorizontalIcon
                  className={`size-6.5 ${isActive ? "animate-icon-pop" : ""}`}
                  strokeWidth={1.5}
                  fill={isActive ? "currentColor" : "none"}
                />
              </div>
            )}
          </NavLink>
        </div>
        {/*mr-2.5 for the outer most link (right) (change, when four items are present)*/}
        <div className="flex-1 mx-3 mr-2.5 /*mr-0.5*/ flex items-center justify-center h-full">
          {/* Settings */}
          <NavLink
            to="/settings"
            title={pathname.startsWith("/settings") ? "" : "Settings"}
            draggable={false}
            viewTransition={pathname === "/settings" ? false : true}
            className="group flex flex-col items-center py-4 w-full"
          >
            {({ isActive }) => (
              <div
                className={`transition-all duration-200 will-change-transform ${isActive ? "scale-100" : "text-muted-foreground group-hover:scale-110 group-hover:text-(--lc-muted-foreground-hover)"}`}
              >
                {isActive ? (
                  <Cog6ToothIconSolid className="size-6.5 animate-icon-pop" />
                ) : (
                  <Cog6ToothIcon className="size-6.5" />
                )}
              </div>
            )}
          </NavLink>
        </div>
        {/*Possible new tabs: Search page and favorites page */}
      </div>
    </section>
  );
}
