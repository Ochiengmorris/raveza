import React from "react";
import {
  HomeIcon,
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  BarChart2Icon,
  UserIcon,
  SettingsIcon,
  TagIcon,
} from "lucide-react";
import Image from "next/image";
import logo_blue from "@/images/logo/grupu1.png";
import MenuItemComp from "@/components/seller/MenuItemComp";
import { currentUser } from "@clerk/nextjs/server";
import { RedirectToSignIn } from "@clerk/nextjs";
import LogOutButton from "@/components/seller/LogOutButton";
import Link from "next/link";

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

const Sidebar = async () => {
  const user = await currentUser();

  if (!user) {
    <RedirectToSignIn />;
  }
  return (
    <div className="hidden md:flex md:w-64 lg:w-72 flex-col bg-black text-gray-300 fixed inset-y-0">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center mt-4">
        <Image
          src={logo_blue}
          width={200}
          height={200}
          alt="logo"
          className="object-contain w-12 h-12 md:w-16 md:h-16 "
          priority
        />
      </Link>

      {/* Navigation */}
      <nav className=" px-2 text-sm flex flex-col justify-start gap-4 grow">
        {menuItems.map((section, index) => (
          <MenuItemComp
            key={index}
            title={section.title}
            items={section.items}
          />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-300/20">
        <div className="flex items-center gap-3">
          <Image
            src={user?.imageUrl ?? ""}
            alt="User avatar"
            className="h-10 w-10 rounded-full"
            width={40}
            height={40}
          />
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
  );
};

export default Sidebar;
