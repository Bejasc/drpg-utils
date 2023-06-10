/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-loops/no-loops */
import numeral from "numeral";

/**
 * @param time How long to wait for (Miliseconds)
 * @returns Void, once the time has passed
 */
export async function delay(time: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Clamp a number between a min/max value
 * @param num The value to clamp
 * @param min Smallest possible value
 * @param max Largest possible value
 * @returns The clamped value
 */
export function clamp(num: number, min: number, max: number): number {
	return num <= min ? min : num >= max ? max : num;
}

/**
 * Generate a random number(integer).
 * @param min Smallest number (inclusive)
 * @param max Largest number (inclusive)
 * @returns A number in the range provided
 */
export function randomInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random double (number with decimal points)
 * @param min Smallest number (inclusive)
 * @param max Largest number (inclusive)
 * @param precision (Optional) Number of decimal points. Default is 2.
 * @returns A number in the range provided
 */
export function randomDouble(min: number, max: number, precision = 2): number {
	const val = Math.random() * (max - min) + min;
	return Number(val.toPrecision(precision));
}

/**
 * Takes an array of strings and joins them together in a comma separated string.
 * @param arr The array to transform
 * @returns A single line string, separated by commas, with the last element as "and"
 */
export function joinString(arr: string[], join = "and"): string {
	if (arr.length === 1) return arr[0];
	const firsts = arr.slice(0, arr.length - 1);
	const last = arr[arr.length - 1];
	return `${firsts.join(", ")} ${join} ${last}`;
}

/**
 * Pick a random element from an Array. Type support.
 * @param array The array to pick from
 * @returns A random element from that array
 */
export function randomFromArray<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Take an array and split it into an array of arrays, where the inner array is of N chunks. Type support.
 * @param array The array to split into chunks
 * @param chunkSize Split the array into sub arrays of this many parts
 * @returns Array of Arrays
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const result = [];
	// eslint-disable-next-line no-loops/no-loops
	for (let i = 0, len = array.length; i < len; i += chunkSize) result.push(array.slice(i, i + chunkSize));
	return result;
}

/**
 * Create a Promise that with a property that can allow it to be rejected.
 * Not sure if I still actually use this or not
 */
export class DiscardablePromise<T> {
	public promise: Promise<T>;

	constructor(promise: Promise<T>, public discarded: boolean = false) {
		this.promise = new Promise<T>((resolve, reject) => {
			promise
				// eslint-disable-next-line promise/prefer-await-to-then
				.then(async (...args) => {
					if (this.discarded) return Promise.reject(new Error("Discarded"));

					return resolve(...args);
				})
				// eslint-disable-next-line promise/prefer-await-to-then
				.catch((e) => {
					if (this.discarded) return;

					reject(e);
				});
		});
	}
}

/**
 * Strip all whitespace from a string and force it toLowercase(). Useful for making string comparrisons.
 * @param value The string to alter
 * @returns value with all spaces removed, all lowercase
 */
export function invariant(value: string): string {
	return value.toLowerCase().replace(" ", "");
}

/**
 * Convert a date to an epoch timestam.
 * Useful for Discord <t:X> text to show localized date regardless of region.
 * @param date Date object to convert to Epoc
 * @returns Epoch timestamp
 */
export function dateToEpoch(date: Date): number {
	const result = date.getTime() / 1000;
	return Math.floor(result);
}

/**
 * Format a number like 128,500 as "128.5k"
 * Useful for formatting large numbers into a human readable format.
 * @param value The number to Format
 * @returns Formatted number
 */
export function formatNumberQuantity(value: number): string {
	//const n = numeral(value).format("0,0[[.]0]a", (n) => ~~n);
	return numeral(value).format("0,0[[.]]0a", (n) => ~~n);
}

/**
 * Rounds a value (up or down) to the nearest multiple that is provided
 * @param value The value that will be rounded
 * @param nearestMultiple Round to a multiple of this value
 * @returns The value, rounded to the *nearest* multiple of roundTo
 */
export function roundToNearest(value: number, nearestMultiple: number): number {
	return nearestMultiple * Math.round(value / nearestMultiple);
}

/**
 * Change a timespam from Seconds to a more human readable format, e.g 13200 >> "3 hours and 40 minutes"
 * @param value The value in seconds
 * @returns Human readable timespan
 */
export function secondsToHms(value: number): string {
	const hours = Math.floor(value / 3600);
	const minutes = Math.floor((value % 3600) / 60);
	const seconds = Math.floor((value % 3600) % 60);

	const hDisplay = hours > 0 ? hours + (hours == 1 ? " hour " : " hours ") : "";
	const mDisplay = minutes > 0 ? minutes + (minutes == 1 ? " minute " : " minutes ") : "";
	const sDisplay = seconds > 0 ? seconds + (seconds == 1 ? " second" : " seconds") : "";
	return hDisplay + mDisplay + sDisplay;
}

/**
 * Convert the first char of each word to Uppercase
 * @param value The string to change
 */
export function stringTitleCase(value: string): string {
	return value
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.substring(1))
		.join(" ");
}

/** Include the leading + in a number  */
export function stringifyNumber(value: number): string {
	return `${value > 0 ? "+" : ""}${value}`;
}

export function valueIsString(value: unknown): boolean {
	return typeof value === "string";
}

/**
 * Pass the object type (as generic) and the path to the object ie tradeProperties.baseValue to sort on any property
 * @param objects Array of the objects to sort
 * @param propertyPath Path to the property. Supports top level and nesting.
 * @param order Ascending or Descending
 * @returns Array of <T>, sorted based on preference above
 */
export function sortByProperty<T>(objects: T[], propertyPath: string, order: "ascending" | "descending"): T[] {
	return objects.slice().sort((a, b) => {
		const valueA = getProperty(a, propertyPath);
		const valueB = getProperty(b, propertyPath);

		if (valueA === null || valueA === undefined) {
			return order === "ascending" ? -1 : 1;
		}
		if (valueB === null || valueB === undefined) {
			return order === "ascending" ? 1 : -1;
		}

		if (valueA < valueB) {
			return order === "ascending" ? -1 : 1;
		}
		if (valueA > valueB) {
			return order === "ascending" ? 1 : -1;
		}
		return 0;
	});
}

/**
 * Pass the object type (as generic) and the path to the object ie tradeProperties.category to split the incomign array into multiple arrays based on unique values in the provided path
 * @param objects Array of the objects to sort
 * @param propertyPath Path to the property. Supports top level and nesting.
 * @returns
 */
export function groupByProperty<T>(objects: T[], propertyPath: string): { group: any; value: T[] }[] {
	const groupedMap = new Map<any, T[]>();

	for (const obj of objects) {
		const property = getProperty(obj, propertyPath);
		const group = Array.isArray(property) ? property[0] : property;

		const value = obj;

		if (groupedMap.has(group)) {
			groupedMap.get(group)!.push(value);
		} else {
			groupedMap.set(group, [value]);
		}
	}

	return Array.from(groupedMap.entries()).map(([group, value]) => ({ group, value }));
}

/**
 * Take in any object, and return the value at the matching property path
 * @param obj
 * @param propertyPath Path to the property. Allows top level or any nesting following dot notation
 * @returns Value at property path. Casting may be required
 */
function getProperty(object: any, propertyPath: string): any {
	const properties = propertyPath.split(".");

	for (const property of properties) {
		if (object && property in object) {
			object = object[property];
		} else {
			return undefined;
		}
	}

	return object;
}
