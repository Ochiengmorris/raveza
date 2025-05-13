"use client";

import {
  BarChart2Icon,
  CalendarIcon,
  HomeIcon,
  Menu,
  SettingsIcon,
  TagIcon,
  TicketIcon,
  UserIcon,
  UsersIcon,
  X,
} from "lucide-react";
import React, { useState } from "react";
import logo from "@/images/logo/grupu1.png";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import MenuItemComp from "./MenuItemComp";
import LogOutButton from "./LogOutButton";
import AvatarNameImage from "../other/AvatarNameImage";
import { Button } from "../ui/button";

export const menuItems = [
  {
    title: "DASHBOARD",
    items: [
      {
        icon: <HomeIcon width={20} height={20} className="w-5 h-5 mr-3 " />,
        label: "Overview",
        href: "/seller/overview",
      },
      {
        icon: <CalendarIcon width={20} height={20} className="w-5 h-5 mr-3 " />,
        label: "Events",
        href: "/seller/events",
      },
      {
        icon: <TicketIcon width={20} height={20} className="w-5 h-5 mr-3 " />,
        label: "Tickets",
        href: "/seller/tickets",
      },
      {
        icon: <UsersIcon width={20} height={20} className="w-5 h-5 mr-3 " />,
        label: "Attendees",
        href: "/seller/attendees",
      },
      {
        icon: <TagIcon width={20} height={20} className="w-5 h-5 mr-3 " />,
        label: "Promo Codes",
        href: "/seller/promo-codes",
      },
      {
        icon: (
          <BarChart2Icon width={20} height={20} className="w-5 h-5 mr-3 " />
        ),
        label: "Analytics",
        href: "/seller/analytics",
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        icon: <UserIcon width={20} height={20} className="w-5 h-5 mr-3 " />,
        label: "Profile",
        href: "/seller/profile",
      },
      {
        icon: <SettingsIcon width={20} height={20} className="w-5 h-5 mr-3 " />,
        label: "Settings",
        href: "/seller/settings",
      },
    ],
  },
];

const MobileNavbar = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
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
            className="object-contain w-8 h-8 md:w-10 md:h-10"
            priority
          />
        </div>

        {/* Toggle Button */}
        <Button
          className={`${isOpen ? "hidden" : ""}`}
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          variant={"default"}
        >
          <Menu size={24} />
        </Button>
      </div>

      <div className="relative md:hidden">
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 transition-all duration-1000 ease-in-out z-40"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="md:hidden bg-black text-gray-300 fixed top-0 inset-x-0 z-30 h-16 flex items-center justify-between px-4 shadow-lg">
            <div className="flex items-center">
              <Image
                src={logo}
                width={200}
                height={200}
                alt="logo"
                className="object-contain w-10 h-10 md:w-16 md:h-16"
                priority
              />
            </div>

            {/* Toggle Button */}
            <button
              className={`text-secondary bg-none rounded-md p-2 transition-all duration-300 ease-in-out  ${isOpen ? "" : "hidden"}`}
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col h-full p-4">
            <nav className="mt-16 text-sm flex flex-col justify-start gap-4 grow">
              {menuItems.map((section, index) => (
                <MenuItemComp
                  key={index}
                  title={section.title}
                  items={section.items}
                  toggleSidebar={toggleSidebar}
                />
              ))}
            </nav>

            {/* User Profile */}
            <div className="border-t border-slate-300/20">
              <div className="flex items-center gap-3">
                {user ? (
                  <Image
                    src={user?.imageUrl ?? ""}
                    alt="User avatar"
                    className="h-10 w-10 rounded-full"
                    width={40}
                    height={40}
                  />
                ) : (
                  <AvatarNameImage name={"John Doe"} />
                )}
                <div>
                  <p className="font-medium">{user?.fullName}</p>
                  <p className="text-xs text-slate-400">
                    {user?.emailAddresses[0].emailAddress}
                  </p>
                </div>
              </div>
              <LogOutButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavbar;
