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
import { StretchHorizontalIcon } from "lucide-react"; //Candidate for Entries page 5 (solid)
import { NavLink, useLocation, matchPath } from "react-router-dom";

export function BottomNavigation() {
  const { pathname } = useLocation();

  const hiddenPatterns = [
    "entries/new",
    "/entries/:id/edit", // Matches /entries/123/edit
  ];

  // Check if current path matches any of our hidden patterns
  const isHidden = hiddenPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname),
  );

  return (
    <div
    //className={isHidden ? "mt-0" : "mt-15" /*MAYBE: Animate margin */}
    // put this in the container of content itself
    >
      <section
        id="lc-bottom-navigation-item"
        className={
          `lc-bottom-navigation ${isHidden ? "lc-bottom-navigation--hidden" : ""}
          fixed bottom-0 w-full h-14.75 px-3 z-100 select-none
          border-t bg-background/80 backdrop-blur-lg
          transition-shadow duration 300` /*TODO: Shadow effects (logic necessary: hide when scrolled to bottom)*/
        }
      >
        <div
          className="flex gap-3 items-center justify-between text-center w-full max-w-317 h-full /*max-w-7xl*/ mx-auto inset-x-0"
          // had classes: lc-bottom-navigation-animate-blur ${isHidden ? "lc-bottom-navigation-animate-blur--hidden" : ""}
        >
          <div className="flex-1 mx-1.5 ml-0.5 flex items-center justify-center h-full">
            {/* Home */}
            <NavLink
              to="/"
              title={pathname !== "/" ? "Home" : ""}
              draggable={false}
              viewTransition
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
          <div className="flex-1 mx-1.5 flex items-center justify-center h-full">
            {/* Entries */}
            <NavLink
              to="/entries"
              title={pathname !== "/entries" ? "Entries" : ""}
              draggable={false}
              viewTransition
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
          <div className="flex-1 mx-1.5 mr-0.5 flex items-center justify-center h-full">
            {/* Settings */}
            <NavLink
              to="/settings"
              title={pathname !== "/settings" ? "Settings" : ""}
              draggable={false}
              viewTransition
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
    </div>
  );
}
