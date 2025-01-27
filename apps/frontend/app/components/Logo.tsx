import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/logo.svg" alt="BrainPower Logo" width={32} height={32} />
      <Image src="/text-logo.svg" alt="BrainPower" width={120} height={20} />
    </div>
  );
}

export default Logo;
