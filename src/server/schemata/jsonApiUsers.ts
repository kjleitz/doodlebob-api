import z from "zod";
import { JsonApiCollectionDocument, JsonApiResource, JsonApiResourceDocument } from "./jsonApiBase";
import Role from "../../lib/auth/Role";

const RoleSchema = z.nativeEnum(Role);

export const UserAttributes = z.object({
  username: z.string(),
  email: z.string(),
  role: RoleSchema,
  // notes: z.Array(z.object({})).optional(), // TODO: more accurate
  // labels: z.Array(z.object({})).optional(), // TODO: more accurate
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserCreateAttributes = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().optional(),
});

export const UserAdminCreateAttributes = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().optional(),
  role: RoleSchema.optional(),
});

export const UserUpdateAttributes = z.object({
  username: z.string().optional(),
  newPassword: z.string().optional(),
  oldPassword: z.string().optional(),
  email: z.string().optional(),
});

export const UserAdminUpdateAttributes = z.object({
  username: z.string().optional(),
  newPassword: z.string().optional(),
  oldPassword: z.string().optional(),
  email: z.string().optional(),
  role: RoleSchema.optional(),
});

export const UserNoteResourceLinkage = z.object({
  type: z.literal("notes"),
  id: z.string(),
});

export const UserLabelResourceLinkage = z.object({
  type: z.literal("labels"),
  id: z.string(),
});

export const UserRelationships = z.object({
  notes: z
    .object({
      data: z.array(UserNoteResourceLinkage),
    })
    .optional(),
  labels: z
    .object({
      data: z.array(UserLabelResourceLinkage),
    })
    .optional(),
});

export const UserResource = JsonApiResource.extend({
  type: z.literal("users"),
  attributes: UserAttributes,
  relationships: UserRelationships.optional(),
});

export const UserCreateResource = JsonApiResource.extend({
  type: z.literal("users"),
  attributes: UserCreateAttributes,
});

export const UserUpdateResource = JsonApiResource.extend({
  type: z.literal("users"),
  attributes: UserUpdateAttributes,
});

export const UserResourceDocument = JsonApiResourceDocument.extend({
  data: UserResource,
});

export const UserCollectionDocument = JsonApiCollectionDocument.extend({
  data: z.array(UserResource),
});

export const UserCreateResourceDocument = JsonApiResourceDocument.extend({
  data: UserCreateResource,
});

export const UserUpdateResourceDocument = JsonApiResourceDocument.extend({
  data: UserUpdateResource,
});
