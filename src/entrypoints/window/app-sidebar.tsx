import * as React from "react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import {
  FilePlusIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  PinIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";

import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { TopicDocType } from "@/db/schemas/topic";
import { useSidebarTopics } from "./__hooks__/use-sidebar-topics";

/**
 * Fixed top-level navigation. Entries and Topics point at the Library page with a
 * `?tab=` discriminator — the sidebar acts as the Library tab switcher, so the
 * inner tab bar is hidden in the windowed shell.
 *
 * The Topics item has an always-visible `+` action for creating a new topic. Unlike
 * the hover-only `+` actions on individual topic rows (which are true sub-actions),
 * this one is always shown because creating a topic is a top-level action, not a
 * contextual sub-action of "Topics" as a container.
 */
function NavMain() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { pathname } = location;
  const isOnLibrary = pathname === "/library";
  const activeTab = searchParams.get("tab") || "entries";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === "/"}>
          <NavLink to="/" viewTransition>
            <HomeIcon />
            <span>Home</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isOnLibrary && activeTab === "entries"}
        >
          <NavLink to="/library?tab=entries" viewTransition>
            <FileTextIcon />
            <span>Entries</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isOnLibrary && activeTab === "topics"}
        >
          <NavLink to="/library?tab=topics" viewTransition>
            <FolderIcon />
            <span>Topics</span>
          </NavLink>
        </SidebarMenuButton>
        <SidebarMenuAction
          asChild
          title="New Topic"
          className="border-l border-sidebar-border/50"
        >
          <NavLink to="/library/topics/new" viewTransition>
            <PlusIcon />
          </NavLink>
        </SidebarMenuAction>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/settings")}>
          <NavLink to="/settings" viewTransition>
            <Settings2Icon />
            <span>Settings</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
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
              <NavLink
                to={`/library/topics/${topic.id}`}
                title={topic.name}
                viewTransition
              >
                <PinIcon />
                <span>{topic.name}</span>
              </NavLink>
            </SidebarMenuButton>
            <SidebarMenuAction
              showOnHover
              asChild
              title={`New entry in "${topic.name}"`}
            >
              <NavLink
                to={`/library/entries/new?topicId=${encodeURIComponent(topic.id)}`}
                viewTransition
              >
                <PlusIcon />
              </NavLink>
            </SidebarMenuAction>
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
                <NavLink
                  to={`/library/topics/${topic.id}`}
                  title={topic.name}
                  viewTransition
                  className="group-hover/menu-item:bg-sidebar-accent"
                >
                  <FolderIcon />
                  <span>{topic.name}</span>
                </NavLink>
              </SidebarMenuButton>
              <SidebarMenuAction
                showOnHover
                asChild
                title={`New entry in "${topic.name}"`} // TODO: truncate
              >
                <NavLink
                  to={`/library/entries/new?topicId=${encodeURIComponent(topic.id)}`}
                  viewTransition
                  className="hover:bg-[color-mix(in_oklab,var(--sidebar-accent),black_10%)]! dark:hover:bg-[color-mix(in_oklab,var(--sidebar-accent),white_10%)]"
                >
                  <PlusIcon />
                </NavLink>
              </SidebarMenuAction>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/** Single "New Entry" button. On topic pages, pre-selects the current topic. */
function NavCreate() {
  const { pathname } = useLocation();
  const topicIdMatch = pathname.match(/^\/library\/topics\/([^/]+)/);
  const currentTopicId = topicIdMatch?.[1];

  const newEntryTo = currentTopicId
    ? `/library/entries/new?topicId=${encodeURIComponent(currentTopicId)}`
    : "/library/entries/new";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink to={newEntryTo} viewTransition>
            <FilePlusIcon />
            <span>New Entry</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
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
      <SidebarFooter>
        <NavCreate />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
