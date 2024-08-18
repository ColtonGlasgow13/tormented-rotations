"use client";

import { DiabloButton, DiabloInput, GroupInfo } from "@/components";
import { useRefreshRequest } from "@/hooks";
import usePollForGroup from "@/hooks/usePollForGroup";
import { Group } from "@/types";
import { client } from "@/utils/amplifyUtils";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [currentlyInQueue, setCurrentlyInQueue] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  usePollForGroup(requestId, setGroup, setRequestId, setCurrentlyInQueue);

  useRefreshRequest(
    requestId,
    updatedAt,
    setUpdatedAt,
    username,
    setCurrentlyInQueue
  );

  const sendRequest = async () => {
    setCurrentlyInQueue(true);
    const { data, errors } = await client.models.Request.create({ username });

    if (!data) {
      console.error(errors);
      throw new Error("Request failed");
    }

    setRequestId(data.id);
    setUpdatedAt(data.updatedAt);
  };

  const handleQueueClick = () => {
    if (currentlyInQueue || !!group || !username) {
    } else {
      sendRequest();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-16">
      <h1 className="text-5xl font-black">Tormented Rotations</h1>

      <div className="flex flex-col items-center mt-8">
        <span className="text-lg font-bold text-gray-800">Your Battletag:</span>{" "}
        <DiabloInput
          value={username}
          onChange={setUsername}
          disabled={currentlyInQueue || !!group}
        />
      </div>
      <div className="flex items-start mt-8">
        <DiabloButton
          bossName="Lord Zir"
          onClick={handleQueueClick}
          averageTime=":14"
          disabled={currentlyInQueue || !!group || !username}
        />
      </div>
      {group && (
        <div className="mt-8">
          <GroupInfo group={group} username={username} />
        </div>
      )}
    </main>
  );
}
