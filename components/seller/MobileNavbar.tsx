import { Menu } from "lucide-react";
import React from "react";
import logo from "@/images/logo/new_logo.png";
import Image from "next/image";

const MobileNavbar = () => {
  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden bg-black text-gray-300 fixed top-0 inset-x-0 z-30 h-16 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center">
          <Image
            src={logo}
            width={200}
            height={200}
            alt="logo"
            className="object-contain w-[100px] h-[100px] md:w-[140px] md:h-[140px] absolute -top-4"
            priority
          />
        </div>

        <button className="text-white bg-jmprimary hover:bg-jmprimary/60 rounded-md p-2">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};

export default MobileNavbar;
