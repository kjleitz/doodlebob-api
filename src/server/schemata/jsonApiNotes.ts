import z from "zod";
import { JsonApiCollectionDocument, JsonApiResource, JsonApiResourceDocument } from "./jsonApiBase";

export const NoteAttributes = z.object({
  title: z.string(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NoteAttributes = z.infer<typeof NoteAttributes>;

export const NoteCreateAttributes = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

export type NoteCreateAttributes = z.infer<typeof NoteCreateAttributes>;

export const NoteUpdateAttributes = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

export type NoteUpdateAttributes = z.infer<typeof NoteUpdateAttributes>;

export const NoteLabelResourceLinkage = z.object({
  type: z.literal("labels"),
  id: z.number(), // According to JSON:API spec this MUST be a string, but I guess `ts-japi` does not abide
});

export type NoteLabelResourceLinkage = z.infer<typeof NoteLabelResourceLinkage>;

export const NoteUserResourceLinkage = z.object({
  type: z.literal("users"),
  id: z.string(),
});

export type NoteUserResourceLinkage = z.infer<typeof NoteUserResourceLinkage>;

export const NoteRelationships = z.object({
  labels: z
    .object({
      data: z.array(NoteLabelResourceLinkage),
    })
    .optional(),
  user: z
    .object({
      data: NoteUserResourceLinkage,
    })
    .optional(),
});

export type NoteRelationships = z.infer<typeof NoteRelationships>;

export const NoteCreateRelationships = z.object({
  labels: z
    .object({
      data: z.array(NoteLabelResourceLinkage),
    })
    .optional(),
});

export type NoteCreateRelationships = z.infer<typeof NoteCreateRelationships>;

export const NoteUpdateRelationships = z.object({
  labels: z
    .object({
      data: z.array(NoteLabelResourceLinkage),
    })
    .optional(),
});

export type NoteUpdateRelationships = z.infer<typeof NoteUpdateRelationships>;

export const NoteResource = JsonApiResource.extend({
  type: z.literal("notes"),
  attributes: NoteAttributes,
  relationships: NoteRelationships.optional(),
});

export type NoteResource = z.infer<typeof NoteResource>;

export const NoteCreateResource = JsonApiResource.extend({
  id: z.void(),
  type: z.literal("notes"),
  attributes: NoteCreateAttributes,
  relationships: NoteCreateRelationships.optional(),
});

export type NoteCreateResource = z.infer<typeof NoteCreateResource>;

export const NoteUpdateResource = JsonApiResource.extend({
  type: z.literal("notes"),
  attributes: NoteUpdateAttributes,
  relationships: NoteUpdateRelationships.optional(),
});

export type NoteUpdateResource = z.infer<typeof NoteUpdateResource>;

export const NoteResourceDocument = JsonApiResourceDocument.extend({
  data: NoteResource,
});

export type NoteResourceDocument = z.infer<typeof NoteResourceDocument>;

export const NoteCollectionDocument = JsonApiCollectionDocument.extend({
  data: z.array(NoteResource),
});

export type NoteCollectionDocument = z.infer<typeof NoteCollectionDocument>;

export const NoteCreateResourceDocument = JsonApiResourceDocument.extend({
  data: NoteCreateResource,
});

export type NoteCreateResourceDocument = z.infer<typeof NoteCreateResourceDocument>;

export const NoteUpdateResourceDocument = JsonApiResourceDocument.extend({
  data: NoteUpdateResource,
});

export type NoteUpdateResourceDocument = z.infer<typeof NoteUpdateResourceDocument>;
