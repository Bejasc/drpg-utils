import { Logger } from "drpg-logger";
import fs, { promises as fsp } from "fs";
import Hjson from "hjson";
import path, { resolve } from "path";

async function getFiles(dir: string, endsWith?: string, match?: string) {
	const dirents = await fsp.readdir(dir, { withFileTypes: true });

	const files = await Promise.all(
		dirents
			// eslint-disable-next-line sonarjs/cognitive-complexity
			.map((dirent) => {
				const res = resolve(dir, dirent.name);
				if (dirent.isDirectory()) return getFiles(res, endsWith, match);
				else {
					const filename = path.basename(res);
					if (!endsWith) {
						if (match) {
							if (filename == match) return res;
						} else return res;
					} else {
						if (res.endsWith(endsWith)) return res;
					}
				}
			})
			.filter((x) => x != undefined),
	);
	const result = Array.prototype.concat(...files);
	return result;
}

function readJsonFile<T>(dir: string, joinDir = true): T {
	if (joinDir) dir = path.join(__dirname, dir);

	const content = fs.readFileSync(dir, "utf8");

	return Hjson.parse(content) as T;
}

/**
 * NOTE: THis pathway is for a file where the contents are an ARRAY of T
 * Import JSON to a typed object array from the /data/ folder (outside of src)
 * @param pattern The name of the package you're trying to pull in, eg. 'attributes' will find all *.attributes.json
 * @returns
 */
export async function readEntityList<T>(pattern: string): Promise<T[]> {
	const attributes: T[] = [];

	try {
		const directoryPath = path.join(process.cwd(), "data");
		const files: string[] = await getFiles(directoryPath, `${pattern}.json`);

		files.map((file) => {
			Logger.trace(`Searching for ${pattern}... found ${files.length} files`);
			const data = readJsonFile<T[]>(file, false);
			data.map((s) => attributes.push(s));
		});
	} catch (err) {
		Logger.error(err, `ReadPackage of ${pattern} failed.`);
	}

	return attributes;
}


/**
 * NOTE: THhis pathway is for a file where the contents are of any type extending from {@link ../types/IBasePackage.ts|IBasePackage}
 * Import JSON to a typed object array from the /data/ folder (outside of src)
 * @param pattern The name of the package you're trying to pull in, eg. 'attributes' will find all *.attributes.json
 * @returns
 */
 export async function readEntityPackage<T>(pattern: string): Promise<T[]> {
	//TODO introduce some kind of caching at this level?

	const attributes: T[] = [];

	try {
		const directoryPath = path.join(process.cwd(), "data");
		const files: string[] = await getFiles(directoryPath, `${pattern}.json`);

		files.map((file) => {
			Logger.trace(`Searching for ${pattern}... found ${files.length} files`);
			const data = readJsonFile<T>(file, false);
			attributes.push(data);
		});
	} catch (err) {
		Logger.error(err, `ReadPackage of ${pattern} failed.`);
	}

	return attributes;
}
