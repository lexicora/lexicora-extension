import "./NewEntryPage.css";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, House } from "lucide-react";

function NewEntryPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-4xl font-bold">New Entry Page</h1>
      <div className="mt-6 gap-1 flex justify-center">
        <Link to="/">
          <Button>
            <House /> Back to Home
          </Button>
        </Link>
        <Button onClick={() => navigate(-1)}><ArrowLeft /> Go Back</Button>
      </div>
    </div>
  );
}

export default NewEntryPage;
