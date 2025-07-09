import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import Logo from "@/Logo.png";
import Link from "next/link";
import { AuthButton } from "./auth-button";

export function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image src={Logo} alt="TeleFun Mobile Logo" width={40} height={40} className="rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-primary font-headline">
              RideRegister
            </h1>
            <p className="text-sm text-muted-foreground">TeleFun Mobile Independence Day Ride</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <AuthButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
