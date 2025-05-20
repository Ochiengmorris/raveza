import { Metadata } from "next";
import React from "react";
import EventList from "./EventList";

export const metadata: Metadata = {
  title: "Events",
};

const page = () => {
  return (
    <div className="bg-background/90 pb-12">
      <EventList />
    </div>
  );
};

export default page;
