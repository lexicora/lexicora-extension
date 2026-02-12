import { useNavigate, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";

function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="w-85 overflow-auto h-full p-3 pb-6">
      <PageHeader
        title="Error"
        goBackButton={false}
        hoverOnScroll={false}
        classNameHeaderElement="mb-2"
      />
      <main>
        <h2 className="text-8xl text-red-900 dark:text-red-300">500</h2>
        <p className="text-muted-foreground mt-2">
          Sorry, an unexpected error has occurred. Please try again later or
          contact support if the issue persists.
        </p>
      </main>
    </div>
  );
}

export default ErrorPage;
