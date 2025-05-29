import Image from "next/image";
import Link from "next/link";
import React from "react";
import new_logo from "@/images/logo/grupu1.png";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import DropButton from "@/components/other/UserDropDownButton";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const Header = async () => {
  const user = await currentUser();
  const userDetails = await fetchQuery(api.users.getUserById, {
    userId: user?.id ?? "",
  });
  const isSeller = userDetails && userDetails?.isSeller;
  return (
    <header className="bg-black backdrop-blur-lg sticky top-0 z-50 shadow-sm h-16">
      <div className="flex max-w-7xl m-auto flex-col lg:flex-row items-center gap-4 p-4 relative">
        <div className="flex lg:max-w-[100px] items-center w-full lg:mr-12">
          <Link href="/" className="flex items-center">
            <Image
              src={new_logo}
              width={100}
              height={100}
              alt="logo"
              className="object-contain w-8 h-8 md:w-10 md:h-10"
              priority
            />
          </Link>

          <div className="lg:hidden ml-auto">
            <SignedIn>
              <div className="flex items-center gap-3">
                <Link href="/sell-tickets" className="shrink-0">
                  <button className="bg-none text-accent px-3 py-2 text-sm rounded-lg hover:bg-primary/20 transition-all duration-200 ease-in-out font-semibold shrink-0 cursor-pointer">
                    Sell Tickets
                  </button>
                </Link>
                <DropButton />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-3">
                <Link href="/sell-tickets" className="shrink-0">
                  <button className="bg-none text-accent px-3 py-2 text-xs md:text-sm rounded-lg hover:bg-primary/20 transition-all duration-200 ease-in-out font-semibold shrink-0 cursor-pointer">
                    Sell Tickets
                  </button>
                </Link>
                <SignInButton mode="modal">
                  <button className="bg-primary text-accent shadow hover:bg-primary/90 px-3 py-2 text-xs md:text-sm rounded-lg font-semibold transition cursor-pointer">
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
              {isSeller ? (
                <Link href="/seller/overview" className="shrink-0">
                  <button className="bg-none text-accent px-3 py-2 text-sm rounded-lg hover:bg-primary/20 transition-all duration-200 ease-in-out font-semibold cursor-pointer">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/sell-tickets" className="shrink-0">
                  <button className="bg-none text-accent px-3 py-2 text-sm rounded-lg hover:bg-primary/20 transition-all duration-200 ease-in-out font-semibold cursor-pointer">
                    Sell Tickets
                  </button>
                </Link>
              )}

              <Link href="/tickets" className="shrink-0">
                <button className="bg-primary text-accent shadow hover:bg-primary/90 px-3 py-2 text-sm rounded-lg font-semibold transition cursor-pointer">
                  My Tickets
                </button>
              </Link>
              <UserButton />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-3">
              <Link href="/sell-tickets" className="shrink-0">
                <button className="bg-none px-3 py-2 text-sm rounded-lg hover:bg-primary/20 transition-all text-accent duration-200 ease-in-out font-semibold shrink-0 cursor-pointer">
                  Sell Tickets
                </button>
              </Link>
              <SignInButton mode="modal">
                {/* sign in button */}
                <button className="bg-primary text-accent shadow hover:bg-primary/90 px-3 py-2 text-sm rounded-lg font-semibold transition cursor-pointer ">
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
