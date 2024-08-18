import type { DynamoDBStreamHandler } from "aws-lambda";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
  DynamoDBClient,
  TransactWriteItem,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { randomUUID } from "crypto";

interface UserRequest {
  username: string;
  createdAt: string;
}

// Initialize client
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const request_table_name = "Request-npbf4fy27zfgrlnwwmvmo24tfa-NONE";
const groupPlacement_table_name =
  "GroupPlacement-npbf4fy27zfgrlnwwmvmo24tfa-NONE";

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    // logger.info(`Processing record: ${record.eventID}`);
    // logger.info(`Event Type: ${record.eventName}`);

    if (record.eventName === "INSERT") {
      const oldestUserRequests = await getOldestUsernames();

      if (oldestUserRequests) {
        await createGroupTransaction(oldestUserRequests);
      }
    }
  }
  console.log(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};

const getOldestUsernames = async (): Promise<UserRequest[] | null> => {
  const params = {
    TableName: request_table_name,
  };

  try {
    const data = await docClient.send(new ScanCommand(params));
    const items = data.Items;

    console.log("Items: ", items);

    if (items && items.length >= 4) {
      // Sort items by 'createdAt' to find the oldest ones
      items.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

      // Get the first 4 items (the oldest ones)
      const oldestItems = items.slice(0, 4);

      // Extract and return the usernames of these 4 items
      return oldestItems.map((item) => ({
        username: item.username as string,
        createdAt: item.createdAt as string,
      }));
    }

    // Return null if there are less than 4 items
    return null;
  } catch (err) {
    console.error("Error scanning table:", err);
    throw new Error("Could not scan table");
  }
};

const createGroupTransaction = async (userRequests: UserRequest[]) => {
  if (userRequests.length !== 4) {
    throw new Error("Need exactly 4 players for group");
  }

  const groupCreatedTime = new Date();
  const newId = randomUUID();
  const groupHostUsername = userRequests[0].username;
  const groupJoinerUsernames = userRequests
    .slice(1)
    .map((userRequest) => userRequest.username);

  const transactItems: TransactWriteItem[] = [];

  for (const userRequest of userRequests) {
    const createdAtTime = new Date(userRequest.createdAt);
    const msElapsedForPlacement =
      groupCreatedTime.getTime() - createdAtTime.getTime();

    console.log(userRequest);

    transactItems.push(
      {
        Delete: {
          TableName: request_table_name,
          ConditionExpression: "attribute_exists(username)",
          Key: marshall({
            username: userRequest.username,
          }),
        },
      },
      {
        Put: {
          TableName: groupPlacement_table_name,
          Item: marshall({
            groupId: newId,
            username: userRequest.username,
            msElapsedForPlacement: msElapsedForPlacement,
            groupHost: groupHostUsername,
            groupJoiners: groupJoinerUsernames,
            createdAt: groupCreatedTime.toISOString(),
            updatedAt: groupCreatedTime.toISOString(),
          }),
        },
      }
    );
  }

  try {
    await docClient.send(
      new TransactWriteItemsCommand({
        TransactItems: transactItems,
      })
    );
    console.log("Group transaction completed successfully.");
  } catch (error) {
    console.error("Failed to complete group transaction:", error);
  }
};
