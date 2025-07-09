import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import Logo from "@/Logo.png";

const WavingFlag = () => (
  <div className="relative w-12 h-8">
    <div className="absolute top-0 left-0 w-full h-1/3 bg-[#FF9933] waving-flag" style={{ animationDelay: '0s' }}></div>
    <div className="absolute top-1/3 left-0 w-full h-1/3 bg-white waving-flag" style={{ animationDelay: '0.1s' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#000080]"></div>
      </div>
    </div>
    <div className="absolute top-2/3 left-0 w-full h-1/3 bg-[#138808] waving-flag" style={{ animationDelay: '0.2s' }}></div>
  </div>
);


export function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image src={Logo} alt="TeleFun Mobile Logo" width={40} height={40} className="rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-primary font-headline">
              RideRegister
            </h1>
            <p className="text-sm text-muted-foreground">TeleFun Mobile Independence Day Ride</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WavingFlag />
        </div>
      </div>
    </header>
  );
}
