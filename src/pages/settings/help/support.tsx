import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SettingsItemSeparator } from "@/components/settings";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { REPOSITORY_URL } from "@/constants/site";
import {
  BugIcon,
  ChevronRightIcon,
  CodeXmlIcon,
  HeartPlusIcon,
} from "lucide-react";

/**
 * Where to report a problem. One destination for now — the repository — since
 * that is the only place anyone answers. It is its own page rather than a link
 * straight out of the settings list, so more can join it later (the website,
 * once there is one).
 */

const LINKS = [
  {
    href: `${REPOSITORY_URL}/issues/new`,
    Icon: BugIcon,
    iconColor: "text-red-500",
    title: "Report a problem",
    description:
      "Open an issue on GitHub. Saying which browser you use and what you did before it went wrong is usually enough to reproduce it.",
  },
  {
    href: REPOSITORY_URL,
    Icon: CodeXmlIcon,
    iconColor: "text-violet-500",
    title: "The repository",
    description:
      "The source, the open issues and what is planned. Lexicora is developed in the open.",
  },
] as const;

function SupportPage() {
  return (
    <PageContainer>
      <PageHeader title="Support" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-2">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon">
                <HeartPlusIcon className="size-8 text-rose-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                Lexicora keeps your library on your own device, so nobody else
                can look at it to work out what went wrong.
              </ItemDescription>
              <ItemDescription className="text-pretty line-clamp-none mt-1.5">
                A description of what you did, and what happened instead, is
                what helps.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>

        <section className="not-dark:shadow-xs rounded-2xl">
          {LINKS.map(({ href, Icon, iconColor, title, description }, index) => {
            const isFirst = index === 0;
            const isLast = index === LINKS.length - 1;
            const roundingClass = isFirst
              ? "rounded-2xl rounded-b-none"
              : isLast
                ? "rounded-2xl rounded-t-none"
                : "rounded-none";

            return (
              <div key={href}>
                {index > 0 && <SettingsItemSeparator />}
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  draggable={false}
                  className="group block"
                >
                  <Item
                    variant="muted"
                    size="sm"
                    className={`bg-card hover:bg-card-hover transition-colors ${roundingClass}`}
                  >
                    <ItemMedia variant="icon">
                      <Icon className={`size-5 ${iconColor}`} />
                    </ItemMedia>
                    <ItemContent className="text-left">
                      <ItemTitle>{title}</ItemTitle>
                      <ItemDescription className="line-clamp-none text-pretty">
                        {description}
                      </ItemDescription>
                    </ItemContent>
                    <ChevronRightIcon className="size-4 text-muted-foreground shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </Item>
                </a>
              </div>
            );
          })}
        </section>
      </main>
    </PageContainer>
  );
}

export default SupportPage;
