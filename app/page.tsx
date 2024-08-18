"use client";

import { DiabloButton, DiabloInput } from "@/components";
import useGroupPlacementSubscription from "@/hooks/useGroupPlacementSubscription";
import { client } from "@/utils/amplifyUtils";
import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [currentlyInQueue, setCurrentlyInQueue] = useState<boolean>(false);
  const { group, mounted } = useGroupPlacementSubscription(
    username,
    currentlyInQueue
  );

  // Wait until websocket is mounted before sending request
  // Otherwise, dynamo is so fast the group might get made before the websocket is established
  useEffect(() => {
    if (mounted) {
      client.models.Request.create({ username });
    }
  }, [mounted, username]);

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
          onClick={() => setCurrentlyInQueue(true)}
          disabled={currentlyInQueue}
        />
      </div>
    </main>
  );
}
