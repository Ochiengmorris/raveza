import React from "react";

const AvatarNameImage = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const splicedName = name.toUpperCase().split(" ");
  const initials = splicedName[0][0] + splicedName[1][0];

  return (
    <div>
      <div
        className={`rounded-full bg-primary-foreground text-white flex items-center justify-center ${className} capitalize`}
      >
        {initials}
      </div>
    </div>
  );
};

export default AvatarNameImage;
