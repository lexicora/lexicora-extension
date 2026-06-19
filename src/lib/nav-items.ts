import type { ComponentType } from "react";

import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { HomeIconOutline as CustomHeroHomeIcon } from "@/components/icons/custom-heroicons";
import {
  HomeIcon as HomeIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/24/solid";
import { StretchHorizontalIcon } from "lucide-react";

// Minimal shared contract: className covers all icon systems; additional props
// (fill, strokeWidth, etc.) are passed via iconProps with an index signature so
// both heroicons and lucide-react icons satisfy the type.
type NavIconComponent = ComponentType<{ className?: string; [key: string]: unknown }>;

export interface NavItem {
  path: string;
  label: string;
  /** Inactive-state icon. */
  Icon: NavIconComponent;
  /**
   * Active-state icon. Pass null to reuse Icon with fill="currentColor"
   * (e.g. Library's StretchHorizontalIcon).
   */
  ActiveIcon: NavIconComponent | null;
  /** Extra props forwarded to Icon/ActiveIcon (e.g. strokeWidth, fill). */
  iconProps?: Record<string, unknown>;
  /** When true, any child route matching this path prefix counts as active. */
  matchPrefix: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    path: "/",
    label: "Home",
    Icon: CustomHeroHomeIcon,
    ActiveIcon: HomeIconSolid,
    matchPrefix: false,
  },
  {
    path: "/library",
    label: "Library",
    Icon: StretchHorizontalIcon,
    ActiveIcon: null,
    iconProps: { strokeWidth: 1.5 },
    matchPrefix: true,
  },
  {
    path: "/settings",
    label: "Settings",
    Icon: Cog6ToothIcon,
    ActiveIcon: Cog6ToothIconSolid,
    matchPrefix: true,
  },
];
