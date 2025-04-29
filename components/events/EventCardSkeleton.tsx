"use client";

import { Skeleton } from "@/components/ui/skeleton";

const EventCardSkeleton = () => {
  return (
    <div className="min-h-[370px] rounded-xl overflow-hidden bg-card shadow-md">
      <div className="h-48">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-6 ">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-5/12" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <Skeleton className="col-span-1 flex flex-col">
            <Skeleton className="h-8 " />
            <Skeleton className="h-14 " />
          </Skeleton>
          <div className="col-span-2 flex flex-col">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-full mt-1" />
            <Skeleton className="h-6 mt-2  w-9/12" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default EventCardSkeleton;
