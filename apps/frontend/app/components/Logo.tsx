import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/logo.svg" alt="BrainPower Logo" width={32} height={32} />
      <span className="text-lg font-medium">BrainPower</span>
    </div>
  );
}

export default Logo;
