import { Families, Monster, Monsters } from '@/types/Monster';

export const makeMonsters = (families: Families): Monsters => {
	const monsters: Monsters = {};
	Object.values(families).forEach(ranks => {
		Object.values(ranks).forEach(innermonsters => {
			innermonsters.forEach(monster => {
				monsters[monster.name] = monster;
			});
		});
	});
	return monsters;
};

export const reverseSynth = (monsters: Monsters): void => {
	Object.values(monsters).forEach(monster => {
		monster.synthesis.forEach(synthesis => {
			synthesis.forEach(synth => {
				const synthMonster = monsters[synth];
				if (synthMonster) {
					if (!synthMonster.revSynthesis) {
						synthMonster.revSynthesis = [];
					}
					if (!synthMonster.revSynthesis.includes(monster.name)) {
						synthMonster.revSynthesis.push(monster.name);
					}
				}
			});
		});
	});
};
