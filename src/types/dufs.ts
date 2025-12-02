import * as v from "valibot";

export const DufsJSONSchema = v.object({
	href: v.string(),
	kind: v.literal("Index"),
	uri_prefix: v.string(),
	allow_upload: v.boolean(),
	allow_delete: v.boolean(),
	allow_search: v.boolean(),
	allow_archive: v.boolean(),
	dir_exists: v.boolean(),
	auth: v.boolean(),
	user: v.null(),
	paths: v.array(
		v.object({
			path_type: v.union([v.literal("Dir"), v.literal("File")]),
			name: v.string(),
			mtime: v.number(),
			size: v.number(),
		}),
	),
});

export type DufsJSON = v.InferOutput<typeof DufsJSONSchema>;
