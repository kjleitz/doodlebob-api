import z from "zod";
import { JsonApiCollectionDocument, JsonApiResource, JsonApiResourceDocument } from "./jsonApiBase";

export const LabelAttributes = z.object({
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LabelCreateAttributes = z.object({
  name: z.string(),
});

export const LabelUpdateAttributes = z.object({
  name: z.string().optional(),
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
