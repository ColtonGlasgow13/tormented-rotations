"use client";

import React from "react";

interface Group {
  host: string;
  joiners: string[];
}

interface GroupInfoProps {
  group: Group;
  username: string;
}

const GroupInfo: React.FC<GroupInfoProps> = ({ group, username }) => {
  const isHost = username === group.host;

  return (
    <div className="p-4 bg-gray-800 text-gray-100 border-2 border-red-800 rounded-md">
      {isHost ? (
        <div>
          <h2 className="text-xl font-bold mb-2">You are the host!</h2>
          <p>The following users will be sending you friend requests:</p>
          <ul className="list-disc list-inside mt-2">
            {group.joiners.map((joiner, index) => (
              <li key={index} className="text-gray-300">
                {joiner}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-2">Friend Request Required</h2>
          <p>
            The host of this group is{" "}
            <span className="font-bold">{group.host}</span>.
          </p>
          <p className="mt-2">Please send them a friend request.</p>
        </div>
      )}
    </div>
  );
};

export default GroupInfo;
