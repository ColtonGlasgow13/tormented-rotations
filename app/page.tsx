"use client";

import { DiabloButton, DiabloInput } from "@/components";
import { client } from "@/utils/amplifyUtils";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState<string>("");

  const createRequest = async () => {
    try {
      await client.models.Request.create({ username });
      console.log(`Request created for username: ${username}`);
    } catch (error) {
      console.error("Failed to create request:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-xl">Tormented Rotations</h1>
      <div className="flex items-start mt-8">
        <DiabloInput value={username} onChange={setUsername} />
      </div>
      <div className="flex items-start mt-8">
        <DiabloButton label="Test Button" onClick={createRequest} />
      </div>
    </main>
  );
}
