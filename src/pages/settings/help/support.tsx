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
import { CONTACT_EMAIL, REPOSITORY_URL } from "@/constants/site";
import {
  ArrowUpRightIcon,
  BugIcon,
  CodeXmlIcon,
  HeartPlusIcon,
  MailIcon,
} from "lucide-react";

/**
 * Where to report a problem: the repository, and an email address for anyone
 * without a GitHub account or with something that is not a bug. It is its own
 * page rather than a link straight out of the settings list, so more can join
 * it later (the website, once there is one).
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
    href: `mailto:${CONTACT_EMAIL}`,
    Icon: MailIcon,
    iconColor: "text-sky-500",
    title: "Write an email",
    description: `${CONTACT_EMAIL} — for anything that is not a bug report, or if you have no GitHub account.`,
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
                  // Web links open a tab; mailto hands off to the mail app,
                  // and a new tab for it would be left empty.
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
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
                    {/* Every row here leaves the extension. */}
                    <ArrowUpRightIcon className="size-4.5 text-muted-foreground shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
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
