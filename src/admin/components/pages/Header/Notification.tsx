import React from "react";
import { NotificationProps } from "@admin/@interfaces/common.interface";
import Icon from "@admin/components/core/Icon/Icon";

const Notification: React.FC<NotificationProps> = ({
  iconName,
  notificationsText,
  showNotifications,
  setShowNotifications,
  dropdownRef,
}) => {
  return (
    <div ref={dropdownRef}>
      <Icon
        name={iconName}
        variant="outlined"
        className="cursor-pointer"
        onClick={() => setShowNotifications(!showNotifications)}
      />
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg rounded-lg z-20">
          <div className="p-4">{notificationsText}</div>
        </div>
      )}
    </div>
  );
};

export default Notification;
