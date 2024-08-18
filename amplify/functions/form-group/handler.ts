import type { DynamoDBStreamHandler } from "aws-lambda";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
  BatchWriteItemCommand,
  BatchWriteItemInput,
  DynamoDBClient,
  TransactWriteItem,
  TransactWriteItemsCommand,
  WriteRequest,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const REQUEST_LIFETIME_MS = 30 * 1000;

const REQUEST_TABLE_NAME = process.env.REQUEST_TABLE_NAME;
const GROUPPLACEMENT_TABLE_NAME = process.env.GROUPPLACEMENT_TABLE_NAME;

if (!REQUEST_TABLE_NAME || !GROUPPLACEMENT_TABLE_NAME) {
  throw new Error("Environment not initialized");
}

interface UserRequest {
  id: string;
  username: string;
  createdAt: string;
}

// Initialize client
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === "INSERT") {
      const userRequests = await scanTable();

      const { expired, valid } = separateExpiredRequests(userRequests);

      await Promise.all([
        batchDeleteExpiredUserRequests(expired),
        createGroups(valid),
      ]);
    }
  }
  console.log(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};

const scanTable = async (): Promise<UserRequest[]> => {
  try {
    const data = await docClient.send(
      new ScanCommand({ TableName: REQUEST_TABLE_NAME })
    );
    const items = data.Items;

    if (!items) {
      return [];
    }

    return items.map((item) => ({
      id: item.id as string,
      username: item.username as string,
      createdAt: item.createdAt as string,
    }));
  } catch (err) {
    console.error("Error scanning table:", err);
    throw new Error("Could not scan table");
  }
};

const separateExpiredRequests = (
  requests: UserRequest[]
): { expired: UserRequest[]; valid: UserRequest[] } => {
  const currentTime = new Date().getTime();

  const expired: UserRequest[] = [];
  const valid: UserRequest[] = [];

  for (const request of requests) {
    const createdAtTime = new Date(request.createdAt).getTime();
    const timeElapsed = currentTime - createdAtTime;

    if (timeElapsed > REQUEST_LIFETIME_MS) {
      expired.push(request);
    } else {
      valid.push(request);
    }
  }

  return { expired, valid };
};

const createGroups = async (userRequests: UserRequest[]) => {
  // Sort requests by createdAt (oldest first)
  const sortedRequests = userRequests.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Process each group of 4 requests
  const groups = chunkArray(sortedRequests, 4);

  for (const group of groups) {
    // Skip incomplete groups
    if (group.length !== 4) continue;

    const groupCreatedTime = new Date();
    const groupHostUsername = group[0].username;
    const groupJoinerUsernames = group
      .slice(1)
      .map((userRequest) => userRequest.username);

    const transactItems: TransactWriteItem[] = [];

    for (const userRequest of group) {
      const createdAtTime = new Date(userRequest.createdAt);
      const msElapsedForPlacement =
        groupCreatedTime.getTime() - createdAtTime.getTime();

      transactItems.push(
        {
          Delete: {
            TableName: REQUEST_TABLE_NAME,
            ConditionExpression: "attribute_exists(id)",
            Key: marshall({
              id: userRequest.id,
            }),
          },
        },
        {
          Put: {
            TableName: GROUPPLACEMENT_TABLE_NAME,
            Item: marshall({
              requestId: userRequest.id,
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
      console.log(
        `Group transaction completed successfully for group starting with ${groupHostUsername}.`
      );
    } catch (error) {
      console.error("Failed to complete group transaction:", error);
    }
  }
};

const batchDeleteExpiredUserRequests = async (userRequests: UserRequest[]) => {
  const writeRequests: WriteRequest[] = userRequests.map((userRequest) => ({
    DeleteRequest: {
      Key: marshall({
        id: userRequest.id,
      }),
    },
  }));

  const chunks = chunkArray(writeRequests, 25);

  try {
    for (const chunk of chunks) {
      const params: BatchWriteItemInput = {
        RequestItems: {
          [REQUEST_TABLE_NAME]: chunk,
        },
      };

      await docClient.send(new BatchWriteItemCommand(params));
    }

    console.log("Batch delete completed successfully.");
  } catch (error) {
    console.error("Failed to complete batch delete:", error);
  }
};

// Helper function to chunk an array
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunkedArray: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArray.push(array.slice(i, i + size));
  }
  return chunkedArray;
};
