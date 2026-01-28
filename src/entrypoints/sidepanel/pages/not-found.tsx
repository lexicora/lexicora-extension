import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="lc-page-container flex flex-col items-center justify-center h-full text-center p-4">
      <header className="flex items-center gap-2 mb-2 w-full">
        <Button
          variant="ghost"
          size="icon"
          title="Go back"
          className="shrink-0 size-10 rounded-lg"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="size-4.5" />
        </Button>
        {/*<Link to="/entries">
        <Button variant="ghost" size="icon" title="Go to Entries Home">
          <House />
        </Button>
      </Link>*/}
        <h1 className="flex-1 mr-12 text-2xl font-semibold">Page Not Found</h1>
      </header>
      <main>
        <h2 className="text-8xl">404</h2>
        <p className="text-muted-foreground mt-2">
          The page you are looking for does not exist.
        </p>
      </main>
    </div>
  );
}

export default NotFoundPage;
