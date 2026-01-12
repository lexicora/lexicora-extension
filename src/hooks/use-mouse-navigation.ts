import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// NOTE (feature parity discrepancy): This hook / feature is currently chrome only, as Firefox does not currently support this.
export function useMouseNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseButtons = (e: MouseEvent) => {
      // Button 3: Mouse Back
      if (e.button === 3) {
        e.preventDefault();
        //e.stopPropagation();
        navigate(-1);
      }
      // Button 4: Mouse Forward
      if (e.button === 4) {
        e.preventDefault();
        //e.stopPropagation();
        navigate(1);
      }
    };

    window.addEventListener("auxclick", handleMouseButtons);

    return () => {
      window.removeEventListener("auxclick", handleMouseButtons);
    };
  }, [navigate]);
}
