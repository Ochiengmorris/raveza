import Image from "next/image";
import Link from "next/link";
import React from "react";
import new_logo from "@/images/logo/logo_newer.png";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="border-b bg-background/90 backdrop-blur-lg sticky top-0 z-50 shadow-sm h-16">
      <div className="flex max-w-7xl m-auto flex-col lg:flex-row items-center gap-4 p-4 relative">
        <div className="flex lg:max-w-[100px] items-center w-full lg:mr-12">
          <Link href="/" className="flex items-center">
            <Image
              src={new_logo}
              width={200}
              height={200}
              alt="logo"
              className="object-contain w-[100px] h-[100px] md:w-[180px] md:h-[180px] absolute left-2 lg:-top-14"
              priority
            />
          </Link>

          <div className="lg:hidden ml-auto">
            <SignedIn>
              <div className="flex items-center gap-3">
                <Link href="/sell-tickets" className="shrink-0">
                  <button className="bg-none text-primary-foreground px-3 py-2 text-sm rounded-lg hover:bg-primary/20 transition-all duration-200 ease-in-out font-semibold shrink-0">
                    Sell Tickets
                  </button>
                </Link>
                <UserButton />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-3">
                <Link href="/sell-tickets" className="shrink-0">
                  <button className="bg-none text-primary-foreground px-3 py-2 text-sm rounded-lg hover:bg-primary/20 transition-all duration-200 ease-in-out font-semibold shrink-0">
                    Sell Tickets
                  </button>
                </Link>
                <SignInButton mode="modal">
                  <button className="bg-primary text-primary-foreground shadow hover:bg-primary/90 px-3 py-2 text-sm rounded-lg font-semibold transition">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>

        <div className="hidden lg:flex ml-auto">
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link href="/sell-tickets" className="shrink-0">
                <button className="bg-none text-primary-foreground px-3 py-2 text-sm rounded-lg hover:bg-primary/20 transition-all duration-200 ease-in-out font-semibold">
                  Sell Tickets
                </button>
              </Link>

              <Link href="/tickets" className="shrink-0">
                <button className="bg-primary text-primary-foreground shadow hover:bg-primary/90 px-3 py-2 text-sm rounded-lg font-semibold transition">
                  My Tickets
                </button>
              </Link>
              <UserButton />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-3">
              <Link href="/sell-tickets" className="shrink-0">
                <button className="bg-none text-primary-foreground px-3 py-2 text-sm rounded-lg hover:bg-primary/20 transition-all duration-200 ease-in-out font-semibold shrink-0">
                  Sell Tickets
                </button>
              </Link>
              <SignInButton mode="modal">
                <button className="bg-primary text-primary-foreground shadow hover:bg-primary/90 px-3 py-2 text-sm rounded-lg font-semibold transition  ">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default Header;
