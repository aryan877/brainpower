"use client";

import { Notification } from "./Notification";
import { useNotificationStore } from "../store/notificationStore";

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[320px] sm:w-[380px] max-w-[95vw] pointer-events-none dark:text-white">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto w-full">
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
