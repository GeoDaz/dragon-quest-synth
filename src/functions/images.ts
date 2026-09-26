import { StringObject } from '@/types/Ui';
import { Families } from '@/types/Monster';

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

export const pickImages = (images: StringObject, names: Iterable<string>): StringObject => {
	const picked: StringObject = {};
	for (const name of Array.from(names)) {
		if (images[name]) picked[name] = images[name];
	}
	return picked;
};
