import z from "zod";
import Role from "../../lib/auth/Role";
import { MATCH_VALID_USERNAME, MIN_PASSWORD_LENGTH, VALID_USERNAME_CHARACTERS } from "../../lib/utils/checkers";
import { toSentence } from "../../lib/utils/strings";
import { JsonApiCollectionDocument, JsonApiResource, JsonApiResourceDocument } from "./jsonApiBase";

const VALID_USERNAME_CHARACTERS_LISTED = toSentence(VALID_USERNAME_CHARACTERS.map((char) => `'${char}'`));
const INVALID_USERNAME_CHARACTERS_MESSAGE = `Username must only consist of characters ${VALID_USERNAME_CHARACTERS_LISTED}`;
const PASSWORD_TOO_SHORT_MESSAGE = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

const RoleSchema = z.nativeEnum(Role);
const UsernameSchema = z.string().regex(MATCH_VALID_USERNAME, INVALID_USERNAME_CHARACTERS_MESSAGE);
const PasswordSchema = z.string().min(MIN_PASSWORD_LENGTH, PASSWORD_TOO_SHORT_MESSAGE);

export const UserAttributes = z.object({
  username: z.string(),
  email: z.string(),
  role: RoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserCreateAttributes = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
  email: z.string().optional(),
});

export const UserAdminCreateAttributes = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
  email: z.string().optional(),
  role: RoleSchema.optional(),
});

const PasswordUpdateAttributes = z
  .object({
    newPassword: PasswordSchema,
    oldPassword: z.string().min(1, "Valid current password required to change password."),
  })
  .or(
    z.object({
      newPassword: z.void(),
      oldPassword: z.any().nullish(),
    }),
  );

export const UserUpdateAttributes = PasswordUpdateAttributes.and(
  z.object({
    username: UsernameSchema.optional(),
    // newPassword: PasswordSchema.optional(),
    // oldPassword: z.string().optional(),
    email: z.string().optional(),
  }),
);

export const UserAdminUpdateAttributes = PasswordUpdateAttributes.and(
  z.object({
    username: UsernameSchema.optional(),
    // newPassword: PasswordSchema.optional(),
    // oldPassword: z.string().optional(),
    email: z.string().optional(),
    role: RoleSchema.optional(),
  }),
);

export const UserAuthAttributes = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
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

export const UserAdminCreateResource = JsonApiResource.extend({
  type: z.literal("users"),
  attributes: UserAdminCreateAttributes,
});

export const UserUpdateResource = JsonApiResource.extend({
  type: z.literal("users"),
  attributes: UserUpdateAttributes,
});

export const UserAdminUpdateResource = JsonApiResource.extend({
  type: z.literal("users"),
  attributes: UserAdminUpdateAttributes,
});

export const UserAuthResource = JsonApiResource.extend({
  type: z.literal("auth"),
  attributes: UserAuthAttributes,
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

export const UserAdminCreateResourceDocument = JsonApiResourceDocument.extend({
  data: UserAdminCreateResource,
});

export const UserUpdateResourceDocument = JsonApiResourceDocument.extend({
  data: UserUpdateResource,
});

export const UserAdminUpdateResourceDocument = JsonApiResourceDocument.extend({
  data: UserAdminUpdateResource,
});

export const UserAuthResourceDocument = JsonApiResourceDocument.extend({
  data: UserAuthResource,
});

export type UserAttributes = z.infer<typeof UserAttributes>;
export type UserCreateAttributes = z.infer<typeof UserCreateAttributes>;
export type UserAdminCreateAttributes = z.infer<typeof UserAdminCreateAttributes>;
export type UserUpdateAttributes = z.infer<typeof UserUpdateAttributes>;
export type UserAdminUpdateAttributes = z.infer<typeof UserAdminUpdateAttributes>;
export type UserAuthAttributes = z.infer<typeof UserAuthAttributes>;
export type UserNoteResourceLinkage = z.infer<typeof UserNoteResourceLinkage>;
export type UserLabelResourceLinkage = z.infer<typeof UserLabelResourceLinkage>;
export type UserRelationships = z.infer<typeof UserRelationships>;
export type UserResource = z.infer<typeof UserResource>;
export type UserCreateResource = z.infer<typeof UserCreateResource>;
export type UserAdminCreateResource = z.infer<typeof UserAdminCreateResource>;
export type UserUpdateResource = z.infer<typeof UserUpdateResource>;
export type UserAdminUpdateResource = z.infer<typeof UserAdminUpdateResource>;
export type UserAuthResource = z.infer<typeof UserAuthResource>;
export type UserResourceDocument = z.infer<typeof UserResourceDocument>;
export type UserCollectionDocument = z.infer<typeof UserCollectionDocument>;
export type UserCreateResourceDocument = z.infer<typeof UserCreateResourceDocument>;
export type UserAdminCreateResourceDocument = z.infer<typeof UserAdminCreateResourceDocument>;
export type UserUpdateResourceDocument = z.infer<typeof UserUpdateResourceDocument>;
export type UserAdminUpdateResourceDocument = z.infer<typeof UserAdminUpdateResourceDocument>;
export type UserAuthResourceDocument = z.infer<typeof UserAuthResourceDocument>;
