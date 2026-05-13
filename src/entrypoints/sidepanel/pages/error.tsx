import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();
  //console.error(error);

  if (import.meta.env.PROD) {
    let statusCode = 500;
    let errorMessage =
      "Sorry, an unexpected error has occurred. Please try again later or contact support if the issue persists.";

    if (isRouteErrorResponse(error)) {
      statusCode = error.status;
      if (error.statusText) {
        errorMessage = `Error: ${error.statusText}. Please try again later or contact support if the issue persists.`;
      }
    } else if (error instanceof Error) {
      errorMessage = `Error: ${error.message}. Please try again later or contact support if the issue persists.`;
    }

    return (
      <PageContainer className="mt-0! mb-6!">
        <PageHeader
          title="Error"
          goBackButton={true}
          hoverOnScroll={false}
          classNameHeaderElement="mb-2"
        />
        <main>
          <h2 className="text-8xl text-red-900 dark:text-red-300">
            {statusCode}
          </h2>
          <p className="text-muted-foreground mt-2">{errorMessage}</p>
        </main>
      </PageContainer>
    );
  }

  // Development View
  let errorContent;

  if (isRouteErrorResponse(error)) {
    errorContent = (
      <>
        <h2 className="text-8xl text-red-900 dark:text-red-300">
          {error.status}
        </h2>
        <p className="text-muted-foreground mt-2 text-xl">{error.statusText}</p>
        <div className="mt-4">
          <h3 className="text-xl mb-1.5">Error Details</h3>
          <pre className="text-left text-sm bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap font-lc-monospace">
            {typeof error.data === "string"
              ? error.data
              : JSON.stringify(error.data, null, 2)}
          </pre>
        </div>
      </>
    );
  } else if (error instanceof Error) {
    errorContent = (
      <>
        <h2 className="text-6xl text-red-900 dark:text-red-300 mb-4">Error</h2>
        <h3 className="text-xl mb-1.5">Message</h3>
        <p className="text-muted-foreground text-lg">{error.message}</p>
        <div className="mt-4">
          <h3 className="text-xl mb-1.5">Stack Trace</h3>
          <pre className="text-left text-sm bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap font-lc-monospace">
            {error.stack}
          </pre>
        </div>
      </>
    );
  } else {
    errorContent = (
      <>
        <h2 className="text-6xl text-red-900 dark:text-red-300 mb-4">
          Unknown Error
        </h2>
        <p className="text-muted-foreground mt-2">
          Sorry, an unexpected error has occurred.
        </p>
      </>
    );
  }

  return (
    <PageContainer className="mt-0! mb-0!">
      <PageHeader
        title="Error"
        goBackButton={true}
        hoverOnScroll={false}
        classNameHeaderElement="mb-2"
      />
      <main>{errorContent}</main>
    </PageContainer>
  );
}

export default ErrorPage;
