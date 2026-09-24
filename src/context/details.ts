import { createContext } from 'react';
import {
	GameFarewell,
	GameItems,
	GameSpawns,
	GameTalents,
	GameTerms,
	MonstersDetails,
} from '@/types/MonsterDetails';

export interface DetailsContextValue {
	details: MonstersDetails;
	terms: GameTerms;
	farewell: GameFarewell;
	items: GameItems;
	spawns: GameSpawns;
	talents: GameTalents;
	hasDetails: boolean;
	hasSpawns: boolean;
}

export const emptyTerms: GameTerms = { traits: {}, skills: {} };

export const emptyFarewell: GameFarewell = { items: [], amounts: [] };

export const emptyItems: GameItems = {};

export const emptySpawns: GameSpawns = {};

export const emptyTalents: GameTalents = { talents: {}, moves: {} };

export const DetailsContext = createContext<DetailsContextValue>({
	details: {},
	terms: emptyTerms,
	farewell: emptyFarewell,
	items: {},
	spawns: {},
	talents: emptyTalents,
	hasDetails: false,
	hasSpawns: false,
});
