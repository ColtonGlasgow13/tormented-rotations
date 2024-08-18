"use client";

import { Group } from "@/types";
import { client } from "@/utils/amplifyUtils";
import { Dispatch, SetStateAction, useEffect } from "react";

const usePollForGroup = (
  requestId: string | null,
  setGroup: Dispatch<SetStateAction<Group | null>>,
  setRequestId: Dispatch<SetStateAction<string | null>>,
  setCurrentlyInQueue: Dispatch<SetStateAction<boolean>>
) => {
  useEffect(() => {
    if (requestId) {
      const intervalId = setInterval(async () => {
        try {
          // Data will be null until it works
          const { data } = await client.models.GroupPlacement.get({
            requestId,
          });

          if (data) {
            setGroup({ host: data.groupHost, joiners: data.groupJoiners });
            setRequestId(null);
            setCurrentlyInQueue(false);
          }
        } catch (error) {
          console.error("Error polling data:", error);
          clearInterval(intervalId);
        }
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [requestId, setGroup, setRequestId]);
};

export default usePollForGroup;
