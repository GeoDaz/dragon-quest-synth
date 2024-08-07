import { Families, Monsters } from '@/types/Monster';

export const reverseSynth = (families: Families): void => {
	const translatedMonsters = require('../../json/monsterTranslations.json');

	const monsters: Monsters = {};
	Object.values(families).forEach(ranks => {
		Object.values(ranks).forEach(innerMonsters => {
			innerMonsters.forEach(monster => {
				const frName = translatedMonsters[monster.name];
				if (frName) {
					monster.nom = frName;
				}
				monsters[monster.name] = monster;
			});
		});
	});

	Object.values(families).forEach(ranks => {
		Object.values(ranks).forEach(innerMonsters => {
			innerMonsters.forEach(monster => {
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
