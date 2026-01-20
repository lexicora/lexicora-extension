import {
  HomeIcon, //Home page
  RectangleStackIcon, //Candidate for Entries page 1
  Bars2Icon, //Candidate for Entries page 2
  Bars3Icon, //Candidate for Entries page 3
  Bars4Icon, //Candidate for Entries page 4
  Cog6ToothIcon, //Settings page
} from "@heroicons/react/24/outline";
import { HomeIconOutline as CustomHeroHomeIcon } from "@/components/icons/custom-heroicons";
import {
  HomeIcon as HomeIconSolid, //Home page
  RectangleStackIcon as RectangleStackIconSolid, //Candidate for Entries page 1
  Cog6ToothIcon as Cog6ToothIconSolid, //Settings page
} from "@heroicons/react/24/solid";
import { StretchHorizontalIcon } from "lucide-react"; //Candidate for Entries page 5 (solid)
import { NavLink } from "react-router-dom";

//<HugeiconsIcon icon={ListViewIcon} /> //Notable mention as Candidate for Entries page (not 100% free)

export function BottomNavigation() {
  return (
    <div className="mt-15">
      <section
        id="lc-bottom-navigation-item"
        className={
          `lc-bottom-navigation fixed bottom-0 w-full px-3 z-100
        border-t bg-background/80 backdrop-blur-lg
        transition-shadow duration 300` /*TODO: Shadow effects */
        }
      >
        <div className="flex gap-3 items-center justify-between w-full max-w-317 /*max-w-7xl*/ mx-auto inset-x-0">
          <div className="flex-1 mx-1.5 ml-0.5">
            <NavLink
              to="/"
              className={({ isActive, isPending }) =>
                `block py-3 w-full ${isPending ? "" : isActive ? "" : ""}`
              }
            >
              Home
            </NavLink>
          </div>
          <div className="flex-1 mx-1.5 py-3">B</div>
          <div className="flex-1 mx-1.5 mr-0.5 py-3">C</div>
        </div>
      </section>
    </div>
  );
}
