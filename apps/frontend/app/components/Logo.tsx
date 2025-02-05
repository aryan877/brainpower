import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Logo() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center">
        <Image
          src="/logo-group.svg"
          alt="BrainPower Logo"
          width={152}
          height={32}
          priority
        />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Image
        src={theme === "dark" ? "/logo-group.svg" : "/logo-group-light.svg"}
        alt="BrainPower Logo"
        width={152}
        height={32}
        priority
      />
    </div>
  );
}

export default Logo;
