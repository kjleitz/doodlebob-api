import z from "zod";
import { JsonApiCollectionDocument, JsonApiResource, JsonApiResourceDocument } from "./jsonApiBase";

const NameSchema = z.string().min(1, "Label name cannot be empty.");

export const LabelAttributes = z.object({
  name: NameSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LabelCreateAttributes = z.object({
  name: NameSchema,
});

export const LabelUpdateAttributes = z.object({
  name: NameSchema.optional(),
});

export const LabelUserResourceLinkage = z.object({
  type: z.literal("users"),
  id: z.string(),
});

export const LabelNoteResourceLinkage = z.object({
  type: z.literal("notes"),
  id: z.string(),
});

export const LabelRelationships = z.object({
  user: z
    .object({
      data: LabelUserResourceLinkage,
    })
    .optional(),
  notes: z
    .object({
      data: z.array(LabelNoteResourceLinkage),
    })
    .optional(),
});

export const LabelResource = JsonApiResource.extend({
  type: z.literal("labels"),
  attributes: LabelAttributes,
  relationships: LabelRelationships.optional(),
});

export const LabelCreateResource = JsonApiResource.extend({
  type: z.literal("labels"),
  attributes: LabelCreateAttributes,
});

export const LabelUpdateResource = JsonApiResource.extend({
  type: z.literal("labels"),
  attributes: LabelUpdateAttributes,
});

export const LabelResourceDocument = JsonApiResourceDocument.extend({
  data: LabelResource,
});

export const LabelCollectionDocument = JsonApiCollectionDocument.extend({
  data: z.array(LabelResource),
});

export const LabelCreateResourceDocument = JsonApiResourceDocument.extend({
  data: LabelCreateResource,
});

export const LabelUpdateResourceDocument = JsonApiResourceDocument.extend({
  data: LabelUpdateResource,
});

export type LabelAttributes = z.infer<typeof LabelAttributes>;
export type LabelCreateAttributes = z.infer<typeof LabelCreateAttributes>;
export type LabelUpdateAttributes = z.infer<typeof LabelUpdateAttributes>;
export type LabelUserResourceLinkage = z.infer<typeof LabelUserResourceLinkage>;
export type LabelNoteResourceLinkage = z.infer<typeof LabelNoteResourceLinkage>;
export type LabelRelationships = z.infer<typeof LabelRelationships>;
export type LabelResource = z.infer<typeof LabelResource>;
export type LabelCreateResource = z.infer<typeof LabelCreateResource>;
export type LabelUpdateResource = z.infer<typeof LabelUpdateResource>;
export type LabelResourceDocument = z.infer<typeof LabelResourceDocument>;
export type LabelCollectionDocument = z.infer<typeof LabelCollectionDocument>;
export type LabelCreateResourceDocument = z.infer<typeof LabelCreateResourceDocument>;
export type LabelUpdateResourceDocument = z.infer<typeof LabelUpdateResourceDocument>;
