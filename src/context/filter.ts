import { createContext } from 'react';

export interface FiltersContextInterface {
	resetFilters?: CallableFunction;
	search?: string;
	selectedFamily?: string;
	selectedRank?: string;
}

export const FiltersContext = createContext<FiltersContextInterface>({});
