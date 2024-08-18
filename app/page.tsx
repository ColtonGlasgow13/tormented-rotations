"use client";

import { DiabloButton, DiabloInput, GroupInfo } from "@/components";
import { Group } from "@/types";
import { client } from "@/utils/amplifyUtils";
import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [currentlyInQueue, setCurrentlyInQueue] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);

  const sendRequest = async () => {
    setCurrentlyInQueue(true);
    const { data, errors } = await client.models.Request.create({ username });

    if (!data) {
      console.error(errors);
      throw new Error("Request failed");
    }

    setRequestId(data.id);
  };

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
          }
        } catch (error) {
          console.error("Error polling data:", error);
          clearInterval(intervalId);
        }
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [requestId, setGroup, setRequestId]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-5xl font-black">Tormented Rotations</h1>
      <div className="flex items-start mt-8">
        <DiabloInput
          value={username}
          onChange={setUsername}
          disabled={currentlyInQueue}
        />
      </div>

      <div className="flex items-start mt-8">
        <DiabloButton
          label="Test Button"
          onClick={sendRequest}
          disabled={currentlyInQueue}
        />
      </div>
      {group && (
        <div className="mt-16">
          <GroupInfo
            group={{ host: "bob", joiners: ["bill", "brent", "been"] }}
            username="bob"
          />
        </div>
      )}
    </main>
  );
}
