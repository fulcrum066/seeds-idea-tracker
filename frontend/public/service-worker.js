self.addEventListener('install', event => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // close the notification popup

  // Identify which button was clicked
  if (event.action === "view") {
    // Open or focus the app and navigate to the idea page
      clients.openWindow(`/admin`)
      
  } else if (event.action === "approve") {
    event.waitUntil(
      fetch(`/api/seeds/seed/${event.notification.data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${event.notification.data.token || ""}`,
        },
        body: JSON.stringify({ status: "approved" }),
      })

      .then((res) => res.json())
      .then((data) => console.log("Sucessfully change seed status:", data))
      .catch((err) => console.error("Failed to change seed status:", err))
    );

  } else {
    event.waitUntil(
      fetch(`/api/seeds/seed/${event.notification.data.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${event.notification.data.token || ""}`,
        },
      })

      .then((res) => {
        if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
        console.log(`Successfully deleted rejected seed ${event.notification.data.id}`);
      })
      .catch((err) => console.error("Failed to delete seed:", err))
    );
  };
});
