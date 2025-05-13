import React from "react";

const AvatarNameImage = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const splicedName = name.toUpperCase().split(" ");
  const initials =
    splicedName.length > 1
      ? splicedName[0].charAt(0) + splicedName[1].charAt(0)
      : splicedName[0].charAt(0) + splicedName[0].charAt(1);

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
