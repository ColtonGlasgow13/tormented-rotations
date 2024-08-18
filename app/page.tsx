import { client } from "@/utils/amplifyUtils";

export default function Home() {
  const createRequest = async () => {
    await client.models.Request.create({ username: "testUsername" });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-xl">Tormented Rotations</h1>
      <div className="flex items-start mt-8">
        <button className="bg-red-400" onClick={createRequest}>
          Testing Button
        </button>
      </div>
    </main>
  );
}
