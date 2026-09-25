import { createContext } from 'react';

export interface FiltersContextInterface {
	resetFilters?: CallableFunction;
	navigate?: (hash: string) => void;
	search?: string;
	selectedFamily?: string;
	selectedRank?: string;
}

export const FiltersContext = createContext<FiltersContextInterface>({});
