"use client";

import { Notification } from "./Notification";
import { useNotificationStore } from "../store/notificationStore";

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotificationStore();

  console.log(notifications);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 min-w-[320px] max-w-[420px] pointer-events-none dark:text-white">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Notification
            type={notification.type}
            message={notification.message}
            details={notification.details}
            isVisible={true}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};
