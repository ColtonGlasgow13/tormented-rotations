"use client";

import { client } from "@/utils/amplifyUtils";
import { Dispatch, SetStateAction, useEffect } from "react";

const useRefreshRequest = (
  requestId: string | null,
  updatedAt: string | null,
  setUpdatedAt: Dispatch<SetStateAction<string | null>>,
  username: string,
  setCurrentlyInQueue: Dispatch<SetStateAction<boolean>>
) => {
  // Refresh the request every 30 seconds based on updatedAt value
  useEffect(() => {
    if (requestId && updatedAt) {
      const refreshRequest = async () => {
        try {
          const { data, errors } = await client.models.Request.update({
            id: requestId,
            username,
          });

          if (!data) {
            console.error(errors);
            throw new Error("Failed to refresh request");
          }

          setUpdatedAt(data.updatedAt); // Update the updatedAt with the new value from the server

          // Schedule the next refresh based on the new updatedAt
          const timeSinceLastUpdate =
            new Date().getTime() - new Date(data.updatedAt).getTime();
          const timeUntilNextRefresh = Math.max(30000 - timeSinceLastUpdate, 0);

          setTimeout(refreshRequest, timeUntilNextRefresh - 5 * 1000);
        } catch (error) {
          console.error("Error refreshing request:", error);
          setCurrentlyInQueue(false);
        }
      };

      // Calculate the initial time until the first refresh
      const initialTimeSinceLastUpdate =
        new Date().getTime() - new Date(updatedAt).getTime();
      const initialTimeUntilNextRefresh = Math.max(
        30000 - initialTimeSinceLastUpdate,
        0
      );

      // Schedule the first refresh 5 seconds early to account for slow connections
      const refreshTimeoutId = setTimeout(
        refreshRequest,
        initialTimeUntilNextRefresh - 5 * 1000
      );

      return () => clearTimeout(refreshTimeoutId);
    }
  }, [requestId, updatedAt, username]);
};

export default useRefreshRequest;
