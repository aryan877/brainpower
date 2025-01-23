import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="absolute top-0 left-0 right-0 h-12 bg-background border-b flex items-center px-4 z-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Logo />
      </div>
    </header>
  );
}

export default Navbar;
