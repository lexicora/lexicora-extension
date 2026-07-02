import * as React from "react";
import {
  NavLink,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
 * Fixed top-level navigation. Topics and Entries point at the Library page with a
 * `?tab=` discriminator — the sidebar acts as the Library tab switcher, so the
 * inner tab bar is hidden in the windowed shell.
 *
 * Order: Home → Topics → Entries → New Entry. Settings lives in the footer since
 * it is a utility page, not part of the primary content flow.
 *
 * The Topics item has an always-visible `+` action for creating a new topic. Unlike
 * the hover-only `+` actions on individual topic rows (which are true sub-actions),
 * this one is always shown because creating a topic is a top-level action, not a
 * contextual sub-action of "Topics" as a container.
 *
 * The New Entry item is context-aware: when on a topic page it pre-selects that topic.
 */
function NavMain() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { pathname } = location;
  const isOnLibrary = pathname === "/library";
  const activeTab = searchParams.get("tab") || "entries";

  const topicIdMatch = pathname.match(/^\/library\/topics\/([^/]+)/);
  const currentTopicId = topicIdMatch?.[1];
  const newEntryTo = currentTopicId
    ? `/library/entries/new?topicId=${encodeURIComponent(currentTopicId)}`
    : "/library/entries/new";

  const navToNewEntry = () => {
    navigate(newEntryTo, { viewTransition: true });
  };

  return (
    <div>
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
      </SidebarMenu>
      <Separator className="mx-auto my-2 opacity-60 max-w-[calc(100%-16px)]" />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="transition-colors" asChild>
            {/* <NavLink to={newEntryTo} viewTransition>
              <FilePlusIcon />
              <span>New Entry</span>
            </NavLink> */}
            <Button
              variant="outline"
              className="font-medium not-dark:bg-input-bg/90 not-dark:hover:bg-gray-100/80"
              onClick={() => navigate(newEntryTo, { viewTransition: true })}
            >
              <FilePlusIcon />
              <span>New Entry</span>
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
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
                  className="hover:bg-[color-mix(in_oklab,var(--sidebar-accent),black_10%)]! dark:hover:bg-[color-mix(in_oklab,var(--sidebar-accent),white_10%)]!"
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

function NavSettings() {
  const { pathname } = useLocation();

  return (
    <SidebarMenu>
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
        <NavSettings />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
