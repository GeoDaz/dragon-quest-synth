import { useCallback, useContext } from 'react';
import { LanguageContext } from '@/context/language';
import { StringObject } from '@/types/Ui';
import { withoutAlt } from '@/functions';
const translatedMonsters = require('../json/monsterTranslations.json');
const translatedMoves: StringObject = require('../json/movesTranslations.json');
const translatedSkills: StringObject = require('../json/skillsTranslations.json');
const translatedTraits: StringObject = require('../json/traitsTranslations.json');
const translatedAreas: StringObject = require('../json/areasTranslations.json');

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
	'Enlarge the image': "Agrandir l'image",
	White: 'Blanc',
	Silver: 'Argent',
	Gold: 'Or',
	Rainbow: 'Multicolore',
	'Collapse the synthesis': 'Replier la synthèse',
	'Expand the synthesis': 'Déplier la synthèse',
	'Download the image': "Télécharger l'image",
	'Search a monster or a skill set': 'Rechercher un monstre ou un talent',
	'Search a monster': 'Rechercher un monstre',
	'No result.': 'Aucun résultat.',
	Reserve: 'Réserve',
	'Open the reserve': 'Ouvrir la réserve',
	'Close the reserve': 'Fermer la réserve',
	'Empty the reserve': 'Vider la réserve',
	'Expand the reserve': 'Agrandir la réserve',
	'Shrink the reserve': 'Réduire la réserve',
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
	Goal: 'Objectif',
	Goals: 'Objectifs',
	'Add as a goal': 'Ajouter aux objectifs',
	'Remove from goals': 'Retirer des objectifs',
	'Clear the goals': 'Vider les objectifs',
	'Ready to synthesize': 'Prêt à synthétiser',
	'Missing components': 'Composants manquants',
	'No synthesis for this monster.': 'Aucune synthèse pour ce monstre.',
	'Show other syntheses': 'Voir les autres synthèses',
	'Hide other syntheses': 'Masquer les autres synthèses',
	'Monsters in reserve': 'Monstres en réserve',
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
	Frizz: 'Flamme',
	Sizz: 'Crame',
	Bang: 'Bang',
	Woosh: 'Tornade',
	Crack: 'Glace',
	Rubble: 'Roche',
	Zap: 'Foudre',
	Zam: 'Elec',
	Donk: 'Lest',
	'Fire breath': 'Souffle de feu',
	'Ice breath': 'Souffle de glace',
	Whack: 'Kill',
	Curse: 'Maudit',
	Immobilized: 'Immobilisé',
	Dazzle: 'Illusion',
	'Drain Magic': 'Aspirmagie',
	Hack: 'Vulnérable',
	Fizzled: 'Enflammé',
	Blunted: 'Ramollo',
	Abiliterator: 'Raptitude',
	Gobstopped: 'Hygiaphone',
	'Ban Dance': 'Antidanse',
	Sag: 'Affaiblo',
	Sap: 'Altération',
	Decelerate: 'Décélero',
	Dim: 'Simplet',
	Heal: 'Soin',
	Bounce: 'Réflexion',
	Mega: 'Méga',
	Giga: 'Giga',
	Ultra: 'Ultra',
	'Golden Land': 'Eldorado',
	'after clearing': 'après avoir terminé',
	'the story': "l'histoire",
};

const useTranslate = () => {
	const isFr = useContext(LanguageContext);

	const translateMonster = (name: string): string => {
		const base = withoutAlt(name);
		return (isFr && translatedMonsters[base]) || base;
	};
	const translateUI = (word: string) => {
		if (isFr) return translatedUI[word] || word;
		return word;
	};
	const translateArea = (area: string): string => {
		if (!isFr) return area;
		const [, place, note] = area.match(/^(.*?)(?: \((.*)\))?$/) || [];
		const label = place
			.split(' : ')
			.map(part => translatedAreas[part] || part)
			.join(' : ');
		if (!note) return label;
		const cleared = note.match(/^after clearing (.*)$/)?.[1];
		if (cleared) {
			const world = translatedAreas[cleared] || translatedUI[cleared] || cleared;
			return `${label} (${translatedUI['after clearing']} ${world})`;
		}
		const tags = note.split(', ').map(tag => translatedUI[tag] || tag);
		return `${label} (${tags.join(', ')})`;
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
		translateArea,
		translateMove,
		translateSkill,
		translateTrait,
	};
};

export default useTranslate;
