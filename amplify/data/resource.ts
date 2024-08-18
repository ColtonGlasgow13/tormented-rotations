import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Request: a
    .model({
      username: a.string().required(),
    })
    .identifier(["username"])
    .authorization((allow) => [allow.guest()]),
  GroupPlacement: a
    .model({
      groupId: a.id().required(),
      username: a.string().required(),
      msElapsedForPlacement: a.integer().required(),
      groupHost: a.string().required(),
      groupJoiners: a.string().required().array().required(),
    })
    .identifier(["groupId", "username"])
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
