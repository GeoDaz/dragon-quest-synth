import { createContext } from 'react';
import {
	GameFarewell,
	GameItems,
	GameSpawns,
	GameTerms,
	MonstersDetails,
} from '@/types/MonsterDetails';

export interface DetailsContextValue {
	details: MonstersDetails;
	terms: GameTerms;
	farewell: GameFarewell;
	items: GameItems;
	spawns: GameSpawns;
	hasDetails: boolean;
	hasSpawns: boolean;
}

export const emptyTerms: GameTerms = { traits: {}, skills: {} };

export const emptyFarewell: GameFarewell = { items: [], amounts: [] };

export const emptyItems: GameItems = {};

export const emptySpawns: GameSpawns = {};

export const DetailsContext = createContext<DetailsContextValue>({
	details: {},
	terms: emptyTerms,
	farewell: emptyFarewell,
	items: {},
	spawns: {},
	hasDetails: false,
	hasSpawns: false,
});
