type CallbackFunction = () => void;

interface TimerEntry {
	callback: () => void;
	interval: number;
	nextTick: number;
}

/**
 * Timer class to manage scheduling and executing callback functions at specific intervals.
 */
export default class DrpgTimer {
	private timerQueue: TimerEntry[] = [];
	private timerId: NodeJS.Timeout | null = null;
	private interval: number;
	private timerName: string;
	/**
	 * Create a new Timer instance.
	 * @param {number} interval - The interval (in milliseconds) at which the timer ticks.
	 */
	constructor(name: string, interval: number) {
		this.timerName = name;
		this.interval = interval;
		this.start();
	}

	/**
	 * Schedule a callback function to be executed at the specified interval.
	 * @param {CallbackFunction} callback - The callback function to be scheduled.
	 * @param {number} interval - The interval (in milliseconds) at which the callback should be executed.
	 */
	public schedule(callback: CallbackFunction, interval: number) {
		const entry: TimerEntry = {
			callback,
			interval,
			nextTick: Date.now() + interval,
		};

		this.insert(entry);
	}

	/**
	 * Remove a callback function from the scheduled tasks.
	 * @param {CallbackFunction} callback - The callback function to be removed.
	 */
	public remove(callback: CallbackFunction) {
		this.timerQueue = this.timerQueue.filter((entry) => entry.callback !== callback);
	}

	private insert(entry: TimerEntry) {
		this.timerQueue.push(entry);
		this.timerQueue.sort((a, b) => a.nextTick - b.nextTick);

		if (this.timerId === null) {
			this.start();
		}
	}

	private tick() {
		const currentTime = Date.now();

		// eslint-disable-next-line no-loops/no-loops
		while (this.timerQueue.length > 0 && this.timerQueue[0].nextTick <= currentTime) {
			const entry = this.timerQueue.shift();
			if (entry) {
				entry.callback();
				entry.nextTick = currentTime + entry.interval;
				this.insert(entry);
			}
		}
	}

	private start() {
		if (this.timerId === null) {
			this.timerId = setInterval(() => this.tick(), this.interval);
		}
	}

	/**
	 * Stop the timer and clear all scheduled tasks.
	 */
	public stop() {
		if (this.timerId !== null) {
			clearInterval(this.timerId);
			this.timerId = null;
			this.timerQueue = [];
		}
	}
}
