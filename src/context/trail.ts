import { createContext } from 'react';

// Only the walk callbacks travel through the context: they are stable, so the
// memoized monster rows never re-render when the tree itself changes.
export interface TrailContextInterface {
	walkInto?: (monster: string, into: string) => void;
	walkFrom?: (child: string, recipe: string[]) => void;
}

export const TrailContext = createContext<TrailContextInterface>({});
