export interface Game {
	key: string;
	title: string;
	series: string;
	extension?: Exclude<string, 'webp'>;
	available: boolean;
	ranks: string[];
}
