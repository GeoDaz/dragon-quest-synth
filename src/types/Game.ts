export interface Game {
	key: string;
	title: string;
	titleFr?: string;
	alias?: string;
	series: string;
	extension?: Exclude<string, 'webp'>;
	available: boolean;
	ranks: string[];
}
