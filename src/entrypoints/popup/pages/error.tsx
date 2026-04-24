import { PageHeader } from "@/components/page-header";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();
  //console.error(error);

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
    <div className="w-85 overflow-auto h-full p-3 pb-6 select-none">
      <PageHeader
        title="Error"
        goBackButton={false}
        hoverOnScroll={false}
        classNameHeaderElement="mb-2"
      />
      <main>
        <h2 className="text-8xl text-red-900 dark:text-red-300">
          {statusCode}
        </h2>
        <p className="text-muted-foreground mt-2">{errorMessage}</p>
      </main>
    </div>
  );
}

export default ErrorPage;
