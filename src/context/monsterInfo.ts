import { createContext } from 'react';

export type MonsterInfo = [family: string, games: string];

export type MonsterInfos = { [name: string]: MonsterInfo };

export const MonsterInfoContext = createContext<MonsterInfos>({});
