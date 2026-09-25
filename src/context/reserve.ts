import { createContext } from 'react';
import { ReserveStock } from '@/functions/reserve';

export interface ReserveContextInterface {
	stock?: ReserveStock;
	goals?: string[];
	toggleGoal?: (name: string) => void;
	addToReserve?: (name: string) => void;
	removeFromReserve?: (name: string) => void;
	openReserve?: () => void;
}

export const ReserveContext = createContext<ReserveContextInterface>({});
