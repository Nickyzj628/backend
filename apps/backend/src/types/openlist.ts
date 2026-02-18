import {
	array,
	boolean,
	type InferOutput,
	null_,
	nullable,
	number,
	object,
	pipe,
	string,
	transform,
	union,
} from "valibot";

const FileSchema = pipe(
	object({
		id: string(),
		path: string(),
		name: string(),
		size: number(),
		is_dir: boolean(),
		modified: string(),
		created: string(),
		sign: string(),
		thumb: string(),
		type: number(),
		hashinfo: union([string(), null_()]),
		hash_info: nullable(string(), null),
	}),
	transform((input) => ({
		...input,
		created: Date.parse(input.created),
		modified: Date.parse(input.modified),
	})),
);

export type WebDavFile = InferOutput<typeof FileSchema>;

export const WebDavListResponseSchema = object({
	code: number(),
	message: string(),
	data: object({
		content: array(FileSchema),
		total: number(),
		readme: string(),
		header: string(),
		write: boolean(),
		provider: string(),
	}),
});

export const WebDavFileResponseSchema = object({
	code: number(),
	message: string(),
	data: FileSchema,
});
