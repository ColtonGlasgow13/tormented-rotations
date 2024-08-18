import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Request: a
    .model({
      username: a.string().required(),
    })
    .authorization((allow) => [allow.guest()]),
  GroupPlacement: a
    .model({
      requestId: a.id().required(),
      msElapsedForPlacement: a.integer().required(),
      groupHost: a.string().required(),
      groupJoiners: a.string().required().array().required(),
    })
    .identifier(["requestId"])
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
