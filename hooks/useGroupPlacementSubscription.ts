"use client";

import { client } from "@/utils/amplifyUtils";
import { useEffect, useState } from "react";

interface Group {
  host: string;
  joiners: string[];
}

const useGroupPlacementSubscription = (username: string, enabled: boolean) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    console.log("useEffect running");
    if (enabled) {
      const groupPlacementSub = client.models.GroupPlacement.onCreate({
        filter: {
          username: {
            contains: username,
          },
        },
      }).subscribe({
        next: (data) => {
          console.log(data);
          setGroup({ host: data.groupHost, joiners: data.groupJoiners });
        },
        error: (error) => console.warn(error),
      });

      setMounted(true);

      return () => {
        groupPlacementSub.unsubscribe();
        setMounted(false);
      };
    }
  }, [username, enabled]);

  return { group, mounted };
};

export default useGroupPlacementSubscription;
