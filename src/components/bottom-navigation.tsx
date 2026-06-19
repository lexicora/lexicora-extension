import style from "./bottom-navigation.module.css";
import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "@/lib/nav-items";
import { NavLink, useLocation, matchPath } from "react-router-dom";

import { useScrollPos } from "@/providers/scroll-observer";

export function BottomNavigation() {
  const { pathname, search } = useLocation();
  const { isAtBottom } = useScrollPos();

  const hiddenPatterns = [
    "/library/entries/new",
    "/library/entries/:id/edit", // Matches /library/entries/123/edit
    "/library/topics/new",
    "/library/topics/:id/edit",
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
      className={cn(
        style.bottomNav,
        "fixed bottom-0 w-full h-14.75 px-2.75 pr-[calc(var(--lc-scrollbar-offset)+1px)] z-100 select-none border-t bg-background/80 backdrop-blur-lg",
        isHidden
          ? style.bottomNavHidden
          : isNoShadowPath
            ? "shadow-none"
            : isAtBottom
              ? "shadow-none"
              : "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)]/4 dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)]/26",
      )}
    >
      {/* was: max-w-[calc(var(--lc-content-max-width)+1rem)] */}
      <div
        className="flex items-center justify-between text-center w-full max-w-(--lc-content-max-width) h-full mx-auto inset-x-0"
        // had classes: lc-bottom-navigation-animate-blur ${isHidden ? "lc-bottom-navigation-animate-blur--hidden" : ""}
      >
        {NAV_ITEMS.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === NAV_ITEMS.length - 1;
          const isLibrary = item.path === "/library";
          const onCurrentRoute = item.matchPrefix
            ? pathname.startsWith(item.path)
            : pathname === item.path;

          return (
            <div
              key={item.path}
              className={cn(
                "flex-1 mx-3 flex items-center justify-center h-full",
                isFirst && "ml-2.5",
                isLast && "mr-2.5",
              )}
            >
              <NavLink
                to={isLibrary && pathname === "/library" ? `/library${search}` : item.path}
                end={!item.matchPrefix}
                onClick={
                  isLibrary
                    ? (e) => {
                        if (pathname === "/library") {
                          e.preventDefault();
                          window.scrollTo({ top: 0 });
                        }
                      }
                    : undefined
                }
                title={onCurrentRoute ? "" : item.label}
                draggable={false}
                viewTransition={pathname === item.path ? false : true}
                className="group flex flex-col items-center py-4 w-full"
              >
                {({ isActive }) => {
                  const { Icon, ActiveIcon, iconProps } = item;
                  const iconNode =
                    isActive && ActiveIcon ? (
                      <ActiveIcon className="size-6.5 animate-icon-pop" />
                    ) : (
                      <Icon
                        className={`size-6.5${isActive ? " animate-icon-pop" : ""}`}
                        {...iconProps}
                        {...(ActiveIcon === null
                          ? { fill: isActive ? "currentColor" : "none" }
                          : undefined)}
                      />
                    );
                  return (
                    <div
                      className={`transition-all duration-200 will-change-transform ${
                        isActive
                          ? "scale-100"
                          : "text-muted-foreground group-hover:scale-110 group-hover:text-lc-muted-foreground-hover"
                      }`}
                    >
                      {iconNode}
                    </div>
                  );
                }}
              </NavLink>
            </div>
          );
        })}
        {/*Possible new tabs: Search page and favorites page (maybe replace settings tab with something else like favorites)*/}
      </div>
    </section>
  );
}
