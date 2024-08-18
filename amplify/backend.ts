import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

import { formGroup } from "./functions/form-group/resource";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { StartingPosition } from "aws-cdk-lib/aws-lambda";

const backend = defineBackend({
  auth,
  data,
  formGroup,
});

const eventSource = new DynamoEventSource(
  backend.data.resources.tables["Request"],
  {
    startingPosition: StartingPosition.LATEST,
  }
);

backend.formGroup.resources.lambda.addEventSource(eventSource);
