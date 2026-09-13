import { Families, Monsters } from '@/types/Monster';

export const indexMonsters = (families: Families): Monsters => {
	const monsters: Monsters = {};
	Object.values(families).forEach(ranks => {
		Object.values(ranks).forEach(innerMonsters => {
			innerMonsters.forEach(monster => {
				monsters[monster.name] = monster;
			});
		});
	});
	return monsters;
};

export const reverseSynth = (families: Families): void => {
	const translatedMonsters = require('../../json/monsterTranslations.json');

	const monsters = indexMonsters(families);
	Object.values(monsters).forEach(monster => {
		const frName = translatedMonsters[monster.name];
		if (frName) {
			monster.nom = frName;
		}
	});

	Object.values(families).forEach(ranks => {
		Object.values(ranks).forEach(innerMonsters => {
			innerMonsters.forEach(monster => {
				if (!monster.synthesis) {
					monster.synthesis = [];
				}
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
		});
	});
};
