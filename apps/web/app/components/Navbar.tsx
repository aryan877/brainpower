import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 h-12 bg-background border-b flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/">
          <Logo />
        </Link>
      </div>
    </header>
  );
}
export default Navbar;
