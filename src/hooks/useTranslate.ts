import { useContext } from 'react';
import { LanguageContext } from '@/context/language';
import { StringObject } from '@/types/Ui';
const translatedMonsters = require('../json/monsterTranslations.json');

const translatedUI: StringObject = {
	Synthesis: 'Synthèse',
	'Synthesize into': 'Se synthètise en',
	Egg: 'Oeuf',
	Void: 'Vider',
	Family: 'Famille',
	Rank: 'Rang',
	Subfamily: 'Sous-famille',
	Slime: 'Gluant',
	Dragon: 'Dragon',
	Beast: 'Bête',
	Material: 'Matière',
	Nature: 'Nature',
	Demon: 'Démon',
	Undead: 'Zombie',
	'???': '???',
	Unknown: 'Inconnu',
	White: 'Blanc',
	Silver: 'Argent',
	Gold: 'Or',
	Rainbow: 'Multicolore',
};

const useTranslate = () => {
	const isFr = useContext(LanguageContext);

	const translateMonster = (name: string): string => {
		if (isFr) return translatedMonsters[name] || name;
		return name;
	};
	const translateUI = (word: string) => {
		if (isFr) return translatedUI[word] || word;
		return word;
	};

	return { isFr, translateMonster, translateUI };
};

export default useTranslate;
