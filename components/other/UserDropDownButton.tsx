"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
      <DropdownMenuContent className="w-42 -translate-x-14">
        <DropdownMenuItem>
          <Button
            variant={"outline"}
            onClick={() => redirect("/tickets")}
            className={"w-full justify-center"}
          >
            My Tickets
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem className="">
          <Button
            variant={"link"}
            onClick={async () => await signOut()}
            className={"w-full justify-center"}
          >
            Sign Out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default DropButton;
