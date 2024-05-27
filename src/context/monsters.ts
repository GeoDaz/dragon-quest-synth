import { Monster } from '@/types/Monster';
import { createContext } from 'react';

export const MonstersContext = createContext<{ [key: string]: Monster }>({});
