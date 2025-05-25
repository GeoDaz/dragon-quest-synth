export interface Game {
	key: string;
	title: string;
	extension: Exclude<string, 'webp'>;
	available: boolean;
}
