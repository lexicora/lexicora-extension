import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
} from "@/components/ui/item";
import { REPOSITORY_URL } from "@/constants/site";
import { ScrollTextIcon } from "lucide-react";

// The file itself, not a copy of it: the licence the user reads here is the
// one shipped with this build, and there is nothing to keep in step by hand.
import licenseText from "../../../../LICENSE.txt?raw";

/**
 * Lexicora's own licence, in full and offline.
 *
 * Section 2 asks for the attribution to be reachable by someone using a
 * build, not only present in the source, and a store listing's link is no
 * good without a network. This is that page.
 */
function LicenseSettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="License" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-2 text-left">
        <section className="not-dark:shadow-xs rounded-2xl">
          <Item
            variant="muted"
            size="default"
            className="group py-2.5 gap-2 transition-none bg-card rounded-2xl"
          >
            <ItemHeader>
              <ItemMedia variant="icon">
                <ScrollTextIcon className="size-8 text-amber-500" />
              </ItemMedia>
            </ItemHeader>
            <ItemContent>
              <ItemDescription className="text-pretty line-clamp-none">
                Lexicora is source-available: free to use, change and pass on
                for anything non-commercial, with attribution.
              </ItemDescription>
              <ItemDescription className="text-pretty line-clamp-none mt-1.5">
                Commercial use needs permission. The terms below are the ones
                this build was released under.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>

        <section className="not-dark:shadow-xs rounded-2xl bg-card px-3.5 py-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap wrap-break-word font-sans leading-relaxed select-text">
            {licenseText}
          </pre>
        </section>

        <p className="text-xs text-muted-foreground mx-2.5 -mt-4 text-pretty text-left">
          The third-party components Lexicora is built on keep their own
          licences, listed under{" "}
          <span className="font-medium text-foreground">Licenses</span>. The
          source lives at{" "}
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-lc-muted-foreground-hover"
          >
            the repository
          </a>
          .
        </p>
      </main>
    </PageContainer>
  );
}

export default LicenseSettingsPage;
