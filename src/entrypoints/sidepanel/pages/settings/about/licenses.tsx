import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Item } from "@/components/ui/item";

const LICENSES: { name: string; license: string }[] = [
  { name: "@blocknote/core", license: "MPL-2.0" },
  { name: "@blocknote/react", license: "MPL-2.0" },
  { name: "@blocknote/shadcn", license: "MPL-2.0" },
  { name: "@heroicons/react", license: "MIT" },
  { name: "@hookform/resolvers", license: "MIT" },
  { name: "@radix-ui/*", license: "MIT" },
  { name: "@webext-core/messaging", license: "MIT" },
  { name: "class-variance-authority", license: "Apache-2.0" },
  { name: "clsx", license: "MIT" },
  { name: "DOMPurify", license: "Apache-2.0" },
  { name: "lucide-react", license: "ISC" },
  { name: "next-themes", license: "MIT" },
  { name: "React", license: "MIT" },
  { name: "React DOM", license: "MIT" },
  { name: "React Hook Form", license: "MIT" },
  { name: "React Router", license: "MIT" },
  { name: "React Virtuoso", license: "MIT" },
  { name: "RxDB", license: "Apache-2.0" },
  { name: "RxJS", license: "Apache-2.0" },
  { name: "Sonner", license: "MIT" },
  { name: "Tailwind CSS", license: "MIT" },
  { name: "Turndown", license: "MIT" },
  { name: "uuidv7", license: "MIT" },
  { name: "WXT", license: "MIT" },
  { name: "Zod", license: "MIT" },
];

function LicensesPage() {
  return (
    <PageContainer>
      <PageHeader title="Licenses" goBackButton />
      <main className="flex flex-col gap-5.75 w-full pt-4.5 px-1 mb-1.75">
        <section>
          <p className="text-sm text-muted-foreground ml-2 mb-3 text-pretty">
            Lexicora is built on the shoulders of these open source projects.
          </p>
          <Item
            variant="muted"
            size="xs"
            className="bg-card dark:bg-muted/50 rounded-2xl flex-col gap-0 items-stretch p-0 overflow-hidden"
          >
            {LICENSES.map((lib, i) => (
              <div
                key={lib.name}
                className={`flex items-center justify-between px-3 py-2.5 text-sm ${
                  i < LICENSES.length - 1
                    ? "border-b border-[#c4cbd4] dark:border-[#2b3b52]"
                    : ""
                }`}
              >
                <span className="font-medium">{lib.name}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {lib.license}
                </span>
              </div>
            ))}
          </Item>
        </section>
      </main>
    </PageContainer>
  );
}

export default LicensesPage;
