import { useCallback, useContext } from 'react';
import { LanguageContext } from '@/context/language';
import { StringObject } from '@/types/Ui';
const translatedMonsters = require('../json/monsterTranslations.json');
const translatedMoves: StringObject = require('../json/movesTranslations.json');
const translatedSkills: StringObject = require('../json/skillsTranslations.json');
const translatedTraits: StringObject = require('../json/traitsTranslations.json');

const translatedUI: StringObject = {
	Synthesis: 'Synthèse',
	'Synthesize into': 'Se synthètise en',
	Egg: 'Oeuf',
	Void: 'Vider',
	Family: 'Famille',
	Rank: 'Rang',
	Lower: 'Inférieur',
	'Rang lower': 'Rang inférieur',
	'Rang higher': 'Rang supérieur',
	'Lower monster': 'Monstre inférieur',
	'Any lower monster': 'Tout monstre inférieur',
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
	'Search a monster or a skill set': 'Rechercher un monstre ou un talent',
	Reserve: 'Réserve',
	'Open the reserve': 'Ouvrir la réserve',
	'Close the reserve': 'Fermer la réserve',
	'Empty the reserve': 'Vider la réserve',
	'Add to the reserve': 'Ajouter à la réserve',
	'Remove from the reserve': 'Retirer de la réserve',
	'Already in the reserve': 'Déjà en réserve',
	'Your reserve is empty.': 'Votre réserve est vide.',
	'Add monsters from the list to see what you can synthesize.':
		'Ajoutez des monstres depuis la liste pour voir ce que vous pouvez synthétiser.',
	'Possible syntheses': 'Synthèses possibles',
	'No synthesis available with this reserve.':
		'Aucune synthèse possible avec cette réserve.',
	'Rank up': 'Montée de rang',
	'Show more': 'Voir plus',
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
	Skill: 'Compétence',
	'2nd skill among': 'Second talent parmi',
	Drop: 'Butin',
	Traits: 'Attributs',
	Resistances: 'Résistances',
	Farewell: 'Abandon',
	Location: 'Localisation',
	Season: 'Saison',
	Weather: 'Météo',
	Spring: 'Printemps',
	Summer: 'Été',
	Autumn: 'Automne',
	Winter: 'Hiver',
	Clear: 'Dégagé',
	Rain: 'Pluie',
	Snow: 'Neige',
	Blizzard: 'Blizzard',
	Lightning: 'Orage',
	Smog: 'Smog',
	'Acid Rain': 'Pluie acide',
	'Candy Rain': 'Pluie de bonbons',
	'Lava Shower': 'Pluie de lave',
	'Star Shower': "Pluie d'étoiles",
	'Blood Moon': 'Lune de sang',
	'Spooky Night': 'Nuit lugubre',
	砂嵐: 'Tempête de sable',
	'Day and night': 'Jour et nuit',
	Day: 'Jour',
	Night: 'Nuit',
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
	Bedazzle: 'Éblouissement',
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
	const translateMove = useCallback(
		(name: string): string => (isFr && translatedMoves[name]) || name,
		[isFr]
	);
	const translateSkill = useCallback(
		(name: string): string => (isFr && translatedSkills[name]) || name,
		[isFr]
	);
	const translateTrait = useCallback(
		(name: string): string => (isFr && translatedTraits[name]) || name,
		[isFr]
	);

	return {
		isFr,
		translateMonster,
		translateUI,
		translateMove,
		translateSkill,
		translateTrait,
	};
};

export default useTranslate;
