import z from "zod";

// TODO: technically this should reflect the full JSON:API spec for a resource
//       object (currently it does not)
export const JsonApiResource = z.object({
  type: z.string(),
  id: z.string().nullish(),
  attributes: z.object({}).passthrough(),
  relationships: z.object({}).passthrough().optional(),
});

export const JsonApiErrorBase = z.object({
  stack: z.string(),
  id: z.string().optional(),
  status: z.string().optional(),
  code: z.string().optional(),
  title: z.string().optional(),
  detail: z.string().optional(),
  source: z
    .object({
      pointer: z.string().optional(),
      parameter: z.string().optional(),
    })
    .optional(),
  links: z.object({}).passthrough().optional(), // TODO: link objects
});

export const JsonApiError = JsonApiErrorBase.extend({
  meta: z
    .object({
      original: JsonApiErrorBase, // TODO: check to make sure this is correct
    })
    .optional(),
});

export const JsonApiVersionedDocument = z.object({
  jsonapi: z.object({
    version: z.string(),
  }),
  meta: z.object({}).passthrough().optional(),
  links: z.object({}).passthrough().optional(), // TODO: link objects
});

export const JsonApiResourceDocument = JsonApiVersionedDocument.extend({
  data: JsonApiResource,
});

export const JsonApiCollectionDocument = JsonApiVersionedDocument.extend({
  data: z.array(JsonApiResource),
});

export const JsonApiErrorDocument = JsonApiVersionedDocument.extend({
  errors: z.array(JsonApiError),
});
