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
	Monster: 'Monstre',
	monster: 'monstre',
	monsters: 'monstres',
	Or: 'Ou',
	'Clear filters': 'Tout effacer',
	'Any rank': 'Tout rang',
	Bosses: 'Boss',
	Boss: 'Boss',
	'Final Boss': 'Boss final',
	'Secret Boss': 'Boss secret',
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
	Always: 'Toujours',
	Level: 'Niveau',
	Yes: 'Oui',
	No: 'Non',
	Details: 'Détails',
	White: 'Blanc',
	Silver: 'Argent',
	Gold: 'Or',
	Rainbow: 'Multicolore',
	'Collapse the synthesis': 'Replier la synthèse',
	'Expand the synthesis': 'Déplier la synthèse',
	'Download the image': "Télécharger l'image",
	'Research a monster': 'Rechercher un monstre',
	'No synthesis found': 'Aucune synthèse trouvée',
	'The major bosses of every game in the main Dragon Quest saga, from I to XI.':
		'Les boss majeurs de chaque jeu de la saga principale Dragon Quest, de I à XI.',
	'No data for this monster.': 'Aucune donnée pour ce monstre.',
	Statistics: 'Statistiques',
	Misc: 'Divers',
	Size: 'Taille',
	'Default size': 'Taille par defaut',
	Small: 'Petit',
	Large: 'Grand',
	'Skill set': 'Talent',
	Drop: 'Butin',
	Traits: 'Attributs',
	Resistances: 'Résistances',
	Farewell: 'Abandon',
	Growth: 'Croissance',
	Otherwise: 'Sinon',
	HP: 'PV',
	MP: 'PM',
	Attack: 'Attaque',
	Defence: 'Défense',
	Agility: 'Agilité',
	Wisdom: 'Sagesse',
	Fire: 'Feu',
	Water: 'Eau',
	Wind: 'Vent',
	Earth: 'Terre',
	Explosion: 'Explosion',
	Ice: 'Glace',
	Thunder: 'Foudre',
	Light: 'Lumière',
	Darkness: 'Ténèbres',
	Debuff: 'Affaiblissement',
	Blunt: 'Coup',
	Seal: 'Scellement',
	'MP drain': 'Vol de PM',
	Confusion: 'Confusion',
	Sleep: 'Sommeil',
	Paralysis: 'Paralysie',
	Stun: 'Étourdissement',
	Poison: 'Poison',
	'Instant death': 'Mort subite',
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
