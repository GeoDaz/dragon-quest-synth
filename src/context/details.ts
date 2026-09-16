import { createContext } from 'react';
import {
	GameFarewell,
	GameItems,
	GameTerms,
	MonstersDetails,
} from '@/types/MonsterDetails';

export interface DetailsContextValue {
	details: MonstersDetails;
	terms: GameTerms;
	farewell: GameFarewell;
	items: GameItems;
}

export const emptyTerms: GameTerms = { traits: {}, skills: {} };

export const emptyFarewell: GameFarewell = { items: [], amounts: [] };

export const emptyItems: GameItems = {};

export const DetailsContext = createContext<DetailsContextValue>({
	details: {},
	terms: emptyTerms,
	farewell: emptyFarewell,
	items: {},
});
