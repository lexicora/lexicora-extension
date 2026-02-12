import { PageHeader } from "@/components/page-header";

function NotSupportedPage() {
  return (
    <div className="lc-page-container">
      <div className="lc-page-container-inner">
        <PageHeader
          title="Forbidden"
          goBackButton={true}
          hoverOnScroll={false}
          classNameHeaderElement="mb-2"
        />
        <main>
          <h2 className="text-8xl">403</h2>
          <p className="text-muted-foreground mt-2">
            The feature you are trying to access is either not supported or
            unavailable in the side panel.
          </p>
        </main>
      </div>
    </div>
  );
}

export default NotSupportedPage;
