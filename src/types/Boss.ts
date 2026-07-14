export interface Boss {
	name: string;
	role: string;
	note?: string;
}

export interface BossGame {
	key: string;
	title: string;
	subtitle: string;
	year: number;
	bosses: Boss[];
}
