"use client";

import { DiabloButton, DiabloInput, GroupInfo } from "@/components";
import { Group } from "@/types";
import { client } from "@/utils/amplifyUtils";
import { use, useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [currentlyInQueue, setCurrentlyInQueue] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

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

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-5xl font-black">Tormented Rotations</h1>
      <div className="flex items-start mt-8">
        <DiabloInput
          value={username}
          onChange={setUsername}
          disabled={currentlyInQueue || !!group}
        />
      </div>

      <div className="flex items-start mt-8">
        <DiabloButton
          label="Find a Group"
          onClick={sendRequest}
          disabled={currentlyInQueue || !!group}
        />
      </div>
      {group && (
        <div className="mt-16">
          <GroupInfo group={group} username={username} />
        </div>
      )}
    </main>
  );
}
