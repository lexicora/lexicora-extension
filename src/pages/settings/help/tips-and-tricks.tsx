import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemHeader,
} from "@/components/ui/item";
import { SettingsItemSeparator } from "@/components/settings";
import { cn } from "cn";
import { ChevronRightIcon, LightbulbIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { TIP_CATEGORIES } from "./tips";

/** Rounds the first and last row of a stacked card only. */
function rowRounding(index: number, count: number): string {
  if (count === 1) return "rounded-2xl";
  if (index === 0) return "rounded-2xl rounded-b-none";
  if (index === count - 1) return "rounded-2xl rounded-t-none";
  return "rounded-none";
}

/** The categories of tips; each opens its own page. See `tips.ts`. */
function TipsAndTricksPage() {
  return (
    <PageContainer>
      <PageHeader title="Tips & Tricks" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-2">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon" className="-ml-1">
                <LightbulbIcon className="size-8 text-yellow-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                Some tips and tricks to help you get the most out of Lexicora.
                These are just a few ways to make your library more organized,
                searchable, and useful.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>
        <section className="not-dark:shadow-xs rounded-2xl">
          {TIP_CATEGORIES.map((category, i) => (
            <div key={category.id}>
              {i > 0 && <SettingsItemSeparator />}
              <Item
                variant="muted"
                size="sm"
                className={cn(
                  "group transition-colors duration-150 bg-card hover:bg-card-hover!",
                  rowRounding(i, TIP_CATEGORIES.length),
                )}
                asChild
              >
                <Link
                  to={`/settings/help/tips-and-tricks/${category.id}`}
                  draggable={false}
                  viewTransition
                >
                  <ItemMedia variant="icon">
                    <category.icon className={`size-5 ${category.iconColor}`} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{category.title}</ItemTitle>
                    <ItemDescription className="line-clamp-none text-pretty">
                      {category.summary}
                    </ItemDescription>
                  </ItemContent>
                  <ChevronRightIcon className="size-4 shrink-0 transition-colors duration-150 text-muted-foreground group-hover:text-lc-muted-foreground-hover" />
                </Link>
              </Item>
            </div>
          ))}
        </section>
      </main>
    </PageContainer>
  );
}

export default TipsAndTricksPage;
