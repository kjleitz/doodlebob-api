import z from "zod";
import { JsonApiCollectionDocument, JsonApiResource, JsonApiResourceDocument } from "./jsonApiBase";

export const NoteAttributes = z.object({
  title: z.string(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const NoteCreateAttributes = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

export const NoteUpdateAttributes = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

export const NoteLabelResourceLinkage = z.object({
  type: z.literal("labels"),
  id: z.coerce.string(), // According to JSON:API spec this MUST be a string, but I guess `ts-japi` does not abide
});

export const NoteUserResourceLinkage = z.object({
  type: z.literal("users"),
  id: z.string(),
});

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

export const NoteCreateRelationships = z.object({
  labels: z
    .object({
      data: z.array(NoteLabelResourceLinkage),
    })
    .optional(),
});

export const NoteUpdateRelationships = z.object({
  labels: z
    .object({
      data: z.array(NoteLabelResourceLinkage),
    })
    .optional(),
});

export const NoteResource = JsonApiResource.extend({
  type: z.literal("notes"),
  attributes: NoteAttributes,
  relationships: NoteRelationships.optional(),
});

export const NoteCreateResource = JsonApiResource.extend({
  id: z.void(),
  type: z.literal("notes"),
  attributes: NoteCreateAttributes,
  relationships: NoteCreateRelationships.optional(),
});

export const NoteUpdateResource = JsonApiResource.extend({
  type: z.literal("notes"),
  attributes: NoteUpdateAttributes,
  relationships: NoteUpdateRelationships.optional(),
});

export const NoteResourceDocument = JsonApiResourceDocument.extend({
  data: NoteResource,
});

export const NoteCollectionDocument = JsonApiCollectionDocument.extend({
  data: z.array(NoteResource),
});

export const NoteCreateResourceDocument = JsonApiResourceDocument.extend({
  data: NoteCreateResource,
});

export const NoteUpdateResourceDocument = JsonApiResourceDocument.extend({
  data: NoteUpdateResource,
});

export type NoteAttributes = z.infer<typeof NoteAttributes>;
export type NoteCreateAttributes = z.infer<typeof NoteCreateAttributes>;
export type NoteUpdateAttributes = z.infer<typeof NoteUpdateAttributes>;
export type NoteLabelResourceLinkage = z.infer<typeof NoteLabelResourceLinkage>;
export type NoteUserResourceLinkage = z.infer<typeof NoteUserResourceLinkage>;
export type NoteRelationships = z.infer<typeof NoteRelationships>;
export type NoteCreateRelationships = z.infer<typeof NoteCreateRelationships>;
export type NoteUpdateRelationships = z.infer<typeof NoteUpdateRelationships>;
export type NoteResource = z.infer<typeof NoteResource>;
export type NoteCreateResource = z.infer<typeof NoteCreateResource>;
export type NoteUpdateResource = z.infer<typeof NoteUpdateResource>;
export type NoteResourceDocument = z.infer<typeof NoteResourceDocument>;
export type NoteCollectionDocument = z.infer<typeof NoteCollectionDocument>;
export type NoteCreateResourceDocument = z.infer<typeof NoteCreateResourceDocument>;
export type NoteUpdateResourceDocument = z.infer<typeof NoteUpdateResourceDocument>;
