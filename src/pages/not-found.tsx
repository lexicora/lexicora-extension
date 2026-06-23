import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";

function NotFoundPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Page Not Found"
        goBackButton={true}
        hoverOnScroll={false}
        classNameHeaderElement="mb-2"
      />
      <main className="text-center">
        <h2 className="text-8xl">404</h2>
        <p className="text-muted-foreground mt-2">
          The page you are looking for does not exist.
        </p>
      </main>
    </PageContainer>
  );
}

export default NotFoundPage;
