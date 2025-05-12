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
        className={`rounded-full bg-primary-foreground/10 text-primary flex items-center justify-center ${className} capitalize font-bold`}
      >
        {initials}
      </div>
    </div>
  );
};

export default AvatarNameImage;
