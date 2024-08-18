import type { DynamoDBStreamHandler } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDB } from "aws-sdk";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, TransactGetItem } from "@aws-sdk/client-dynamodb";

// Initialize client
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    // logger.info(`Processing record: ${record.eventID}`);
    // logger.info(`Event Type: ${record.eventName}`);

    if (record.eventName === "INSERT") {
      if (!record.dynamodb || !record.dynamodb.NewImage) {
        return {
          batchItemFailures: [],
        };
      }
      const temp = unmarshall(
        record.dynamodb.NewImage as DynamoDB.DocumentClient.AttributeMap
      );
    }
  }
  console.log(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};

const getOldestUsernames = async (): Promise<string[] | null> => {
  const params = {
    TableName: "YourTableName",
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
      return oldestItems.map((item) => item.username);
    }

    // Return null if there are less than 4 items
    return null;
  } catch (err) {
    console.error("Error scanning table:", err);
    throw new Error("Could not scan table");
  }
};
