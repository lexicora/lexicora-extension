import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { PageHeader } from "../components/ui/page-header";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="lc-page-container select-none">
      <div className="lc-page-container-inner">
        <PageHeader
          title="Page Not Found"
          goBackButton={true}
          hoverOnScroll={false}
          classNameHeaderElement="mb-2"
        />
        <main>
          <h2 className="text-8xl">404</h2>
          <p className="text-muted-foreground mt-2">
            The page you are looking for does not exist.
          </p>
        </main>
      </div>
    </div>
  );
}

export default NotFoundPage;
