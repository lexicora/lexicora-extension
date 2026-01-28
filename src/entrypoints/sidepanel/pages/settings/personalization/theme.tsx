//import "./Settings.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

function ThemePersonalizationSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="lc-page-container select-none">
      <header className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          title="Go back"
          className="size-10 rounded-lg"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="size-4.5" />
        </Button>
        {/*<Link to="/entries">
        <Button variant="ghost" size="icon" title="Go to Entries Home">
          <House />
        </Button>
      </Link>*/}
        <h1 className="text-2xl font-semibold">Theme</h1>
      </header>
      <main>
        <section>
          {/* Personalization settings content goes here */}
          <p>Customize the appearance and behavior of the extension.</p>
        </section>
      </main>
      <footer>{/* Footer content if needed */}</footer>
    </div>
  );
}

export default ThemePersonalizationSettingsPage;
