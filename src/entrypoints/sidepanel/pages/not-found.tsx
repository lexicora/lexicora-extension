import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="lc-page-container select-none">
      <div className="lc-page-container-inner">
        <header className="flex items-center mb-2 w-full">
          {/*w-full for center positioning of title (gap-2 can be removed, with setting mr-12 down below to mr-10)*/}
          <Button
            variant="ghost"
            size="icon"
            title="Go back"
            className="shrink-0 size-10 rounded-lg"
            // shrink-0 for center positioning of title
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="size-4.5" />
          </Button>
          <h1 className="flex-1 mr-10 text-2xl font-semibold">
            Page Not Found
          </h1>
          {/*flex-1 mr-12 (mr-10 if gap-2 is removed) for center positioning of title*/}
        </header>
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
