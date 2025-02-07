"use client";

import { Notification } from "./Notification";
import { useNotificationStore } from "../store/notificationStore";

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-[340px] sm:w-[400px] max-w-[calc(100vw-3rem)] pointer-events-none">
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
