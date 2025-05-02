import EventList from "@/components/events/EventList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Events",
};

const page = () => {
  return (
    <div>
      <EventList />
    </div>
  );
};

export default page;
