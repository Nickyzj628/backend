import {
	array,
	boolean,
	type InferOutput,
	literal,
	null_,
	number,
	object,
	string,
	union,
} from "valibot";

export const DufsJSONSchema = object({
	href: string(),
	kind: literal("Index"),
	uri_prefix: string(),
	allow_upload: boolean(),
	allow_delete: boolean(),
	allow_search: boolean(),
	allow_archive: boolean(),
	dir_exists: boolean(),
	auth: boolean(),
	user: null_(),
	paths: array(
		object({
			path_type: union([literal("Dir"), literal("File")]),
			name: string(),
			mtime: number(),
			size: number(),
		}),
	),
});

export type DufsJSON = InferOutput<typeof DufsJSONSchema>;
