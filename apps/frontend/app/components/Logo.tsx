import Image from "next/image";

export function Logo() {
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

export default Logo;
