import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { SettingsItemSeparator } from "@/components/settings";
import { Navigate, useParams } from "react-router-dom";

import { findTipCategory } from "./tips";

/** Rounds the first and last row of a stacked card only. */
function rowRounding(index: number, count: number): string {
  if (count === 1) return "rounded-2xl";
  if (index === 0) return "rounded-2xl rounded-b-none";
  if (index === count - 1) return "rounded-2xl rounded-t-none";
  return "rounded-none";
}

/** One category's tips. */
function TipsAndTricksCategoryPage() {
  const { category: id } = useParams();
  const category = findTipCategory(id);
  // Only reachable from the list, but a stale history entry could name a
  // category this build no longer has.
  if (!category) {
    return <Navigate to="/settings/help/tips-and-tricks" replace />;
  }

  return (
    <PageContainer>
      <PageHeader title={category.title} goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-2">
        <section className="not-dark:shadow-xs rounded-2xl">
          {category.tips.map((tip, i) => (
            <div key={tip.title}>
              {i > 0 && <SettingsItemSeparator />}
              <Item
                variant="muted"
                size="sm"
                className={`bg-card ${rowRounding(i, category.tips.length)}`}
              >
                <ItemMedia variant="icon">
                  <tip.icon className={`size-5 ${tip.iconColor}`} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{tip.title}</ItemTitle>
                  <ItemDescription className="line-clamp-none text-pretty">
                    {tip.description}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </div>
          ))}
        </section>
      </main>
    </PageContainer>
  );
}

export default TipsAndTricksCategoryPage;
