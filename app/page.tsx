"use client";

import { DiabloButton, DiabloInput } from "@/components";
import { client } from "@/utils/amplifyUtils";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [currentlyInQueue, setCurrentlyInQueue] = useState<boolean>(false);

  const createRequest = async () => {
    try {
      setCurrentlyInQueue(true);
      await client.models.Request.create({ username });
    } catch (error) {
      console.error("Failed to create request:", error);
      setCurrentlyInQueue(false);
    }
  };

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
          onClick={createRequest}
          disabled={currentlyInQueue}
        />
      </div>
    </main>
  );
}
