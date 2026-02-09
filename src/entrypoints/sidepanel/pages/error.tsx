import { useNavigate, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { PageHeader } from "../components/ui/page-header";

function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();
  console.error(error);

  return (
    <div className="lc-page-container mt-0! mb-6! select-none">
      <div className="lc-page-container-inner">
        <PageHeader
          title="Error"
          goBackButton={true}
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
    </div>
  );
}

export default ErrorPage;
