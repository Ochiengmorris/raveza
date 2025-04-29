import { Loader } from "lucide-react";
import React from "react";

const Spinner = () => {
  return (
    <div className=" ">
      <Loader className="animate-spin w-4 h-4" />
    </div>
  );
};

export default Spinner;
