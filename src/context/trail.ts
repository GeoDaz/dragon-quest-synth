import { createContext } from 'react';

export interface TrailContextInterface {
	walkInto?: (monster: string, into: string) => void;
	walkFrom?: (child: string, recipe: string[]) => void;
	addDefault?: (monster: string) => void;
}

export const TrailContext = createContext<TrailContextInterface>({});
