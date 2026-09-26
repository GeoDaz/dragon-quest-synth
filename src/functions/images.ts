import { StringObject } from '@/types/Ui';
import { Families } from '@/types/Monster';

// Tous les noms qu'une page de jeu peut afficher en image : les monstres des
// familles, leurs parents de synthèse (qui alimentent aussi les fils d'Ariane et
// la réserve) et les synthèses inverses. Les jetons « Rank », « Plus », « Family »
// ou « Lower » sont gardés tels quels : ils n'ont pas d'image, pickImages les ignore.
export const familiesImageNames = (families: Families): string[] => {
	const names = new Set<string>();
	Object.values(families).forEach(ranks =>
		Object.values(ranks).forEach(monsters =>
			monsters.forEach(monster => {
				names.add(monster.name);
				monster.synthesis?.forEach(recipe => recipe.forEach(token => names.add(token)));
				monster.revSynthesis?.forEach(name => names.add(name));
			})
		)
	);
	return Array.from(names);
};

// Ne garde de la map nom → URL que les entrées demandées, pour ne pas embarquer
// les ~3200 images dans les props de chaque page (bande passante).
export const pickImages = (images: StringObject, names: Iterable<string>): StringObject => {
	const picked: StringObject = {};
	for (const name of Array.from(names)) {
		if (images[name]) picked[name] = images[name];
	}
	return picked;
};
