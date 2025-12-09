import "./NewEntryPage.css";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { House } from "lucide-react";

function NewEntryPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold">New Entry Page</h1>
      <div className="mt-6">
        <Link to="/">
          <Button>
            <House /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NewEntryPage;
