import * as React from "react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import {
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  PinIcon,
  Settings2Icon,
} from "lucide-react";

import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { TopicDocType } from "@/db/schemas/topic";
import { useSidebarTopics } from "./__hooks__/use-sidebar-topics";

/**
 * Fixed top-level navigation. Entries and Topics point at the Library page with a
 * `?tab=` discriminator — the sidebar acts as the Library tab switcher, so the
 * inner tab bar is hidden in the windowed shell (`hideTabBar`).
 */
function NavMain() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { pathname } = location;
  const isOnLibrary = pathname === "/library";
  const activeTab = searchParams.get("tab") || "entries";

  const items = [
    {
      title: "Home",
      to: "/",
      icon: HomeIcon,
      isActive: pathname === "/",
    },
    {
      title: "Entries",
      to: "/library?tab=entries",
      icon: FileTextIcon,
      isActive: isOnLibrary && activeTab === "entries",
    },
    {
      title: "Topics",
      to: "/library?tab=topics",
      icon: FolderIcon,
      isActive: isOnLibrary && activeTab === "topics",
    },
    {
      title: "Settings",
      to: "/settings",
      icon: Settings2Icon,
      isActive: pathname.startsWith("/settings"),
    },
  ];

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            <NavLink to={item.to}>
              <item.icon />
              <span>{item.title}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

/** Pinned topics. Hidden entirely when there are none. */
function NavPinned({ topics }: { topics: TopicDocType[] }) {
  if (topics.length === 0) return null;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Pinned</SidebarGroupLabel>
      <SidebarMenu>
        {topics.map((topic) => (
          <SidebarMenuItem key={topic.id}>
            <SidebarMenuButton asChild>
              <NavLink to={`/library/topics/${topic.id}`} title={topic.name}>
                <PinIcon />
                <span>{topic.name}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/** Recently updated topics (excluding pinned). Hidden when there are no topics. */
function NavRecent({ topics }: { topics: TopicDocType[] }) {
  if (topics.length === 0) return null;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {topics.map((topic) => (
            <SidebarMenuItem key={topic.id}>
              <SidebarMenuButton asChild>
                <NavLink to={`/library/topics/${topic.id}`} title={topic.name}>
                  <FolderIcon />
                  <span>{topic.name}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pinnedTopics, recentTopics } = useSidebarTopics();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <NavLink
          to="/"
          className="flex items-center gap-2 px-2 py-1.5"
          title="Lexicora"
        >
          <img
            src={lexicoraLightThemeLogoNoBg}
            className="h-5 lc-display-light rounded-xs"
            alt="Lexicora logo"
            draggable="false"
          />
          <img
            src={lexicoraDarkThemeLogoNoBg}
            className="h-5 lc-display-dark rounded-xs"
            alt="Lexicora logo"
            draggable="false"
          />
          <span className="text-base font-semibold">Lexicora</span>
        </NavLink>
        <NavMain />
      </SidebarHeader>
      <SidebarContent>
        <NavPinned topics={pinnedTopics} />
        <NavRecent topics={recentTopics} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
