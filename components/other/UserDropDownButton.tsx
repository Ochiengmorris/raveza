"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

const DropButton = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex cursor-pointer items-center gap-2">
          <Image
            className="rounded-full"
            width={32}
            height={32}
            src={user.imageUrl}
            alt={user.firstName || ""}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-42 -translate-x-14 bg-none">
        <DropdownMenuItem className="bg-none hover:bg-none">
          <button
            onClick={() => redirect("/tickets")}
            className={
              "w-full justify-center  hover:bg-accent cursor-pointer py-2"
            }
          >
            My Tickets
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem className="bg-none hover:bg-none">
          <button
            onClick={async () => await signOut()}
            className={
              "w-full justify-center  hover:bg-accent cursor-pointer py-2"
            }
          >
            Sign Out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default DropButton;
