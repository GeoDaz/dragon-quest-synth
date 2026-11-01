import { useCallback, useContext } from 'react';
import { LanguageContext } from '@/context/language';
import { GameContext } from '@/context/game';
import { StringObject } from '@/types/Ui';
import { Game } from '@/types/Game';
import { withoutAlt } from '@/functions';
import { gameTitle } from '@/functions/games';
const translatedMonsters = require('../json/monsterTranslations.json');
const translatedMoves: StringObject = require('../json/movesTranslations.json');
const translatedSkills: StringObject = require('../json/skillsTranslations.json');
const gameTranslatedSkills: { [game: string]: StringObject } = {
	DQM1: require('../json/DQM1SkillsTranslations.json'),
	DQM2: require('../json/DQM2SkillsTranslations.json'),
	DQM4: require('../json/DQM4SkillsTranslations.json'),
	DQMJ1: require('../json/DQMJ1SkillsTranslations.json'),
	DQMJ2: require('../json/DQMJ2SkillsTranslations.json'),
	DQMJ3: require('../json/DQMJ3SkillsTranslations.json'),
};
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
	Resize: 'Redimensionner',
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
	'Skill sets': 'Talents',
	'Dragon Quest Monsters synthesis': 'Synthèses Dragon Quest Monsters',
	'Synthesis chart': 'Table des synthèses',
	'Synthesis tree builder': 'Créateur d’arbre de synthèse',
	'More tools': 'Autres outils',
	Games: 'Jeux',
	'skill set': 'talent',
	'skill sets': 'talents',
	'Search a skill set': 'Rechercher un talent',
	'No skill set found': 'Aucun talent trouvé',
	'Evolved skill sets': 'Talents évolués',
	'Combined skill sets': 'Talents combinés',
	'Obtained by synthesizing 2 monsters that each have one of the required skill sets with the right amount of SP.':
		'Obtenus en synthétisant 2 monstres ayant chacun un des talents requis avec le bon nombre de PC.',
	'Obtained by synthesizing a monster that has reached the right amount of SP in the previous skill set, or by synthesizing 2 monsters that have this same skill set with the right amount of SP between them.':
		'Obtenus en synthétisant un monstre ayant atteint le bon nombre de PC sur le talent précédent ou en synthétisant 2 monstres ayant ce même talent avec le bon nombre de PC à eux deux.',
	Category: 'Catégorie',
	'Skill sets to max': 'Talents à maxer',
	'Required skill sets': 'Talents requis',
	'Go to this skill set': 'Aller à ce talent',
	'2 among the following': '2 parmi les suivants',
	'1 among the following': '1 parmi les suivants',
	'{min} among the following': '{min} parmi les suivants',
	'{min} to {max} among the following': '{min} à {max} parmi les suivants',
	'together covering': 'réunissant',
	and: 'et',
	SP: 'PC',
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
	Fixed: 'Fixe',
	Initial: 'Initial',
	Gravity: 'Gravité',
	'Resistance down': 'Baisse de résistance',
	'Tension drain': 'Vol de tension',
	'Golden Land': 'Eldorado',
	'after clearing': 'après avoir terminé',
	'the story': "l'histoire",
	'Make your synthesis tree': 'Créez votre arbre de synthèse',
	Edit: 'Éditer',
	View: 'Voir',
	'Save as': 'Enregistrer en',
	'Import from': 'Importer depuis',
	'Report a bug': 'Signaler un bug',
	Legend: 'Légende',
	'Add Column': 'Ajouter une colonne',
	'insert column': 'insérer une colonne',
	'remove column': 'supprimer la colonne',
	'insert row before': 'insérer une ligne avant',
	'insert row': 'insérer une ligne',
	'remove row': 'supprimer la ligne',
	'link it to another monster': 'le relier à un autre monstre',
	'be the target of the link': 'être la cible du lien',
	'collapse 2 cells': 'fusionner 2 cases',
	'uncollapse 2 cells': 'séparer 2 cases',
	'collapse 2 cells in 2 columns': 'fusionner 2 cases sur 2 colonnes',
	'uncollapse 2 cells in 2 rows': 'séparer 2 cases sur 2 lignes',
	'Element Options': "Options de l'élément",
	'Research a Monster': 'Rechercher un monstre',
	'Image URL': "URL de l'image",
	'Upload an image': 'Importer une image',
	'Add a skin (max 3)': 'Ajouter un skin (max 3)',
	'remove skin': 'retirer le skin',
	'remove monster': 'retirer le monstre',
	'mirror mode': 'mode miroir',
	Line: 'Ligne',
	'remove line': 'retirer la ligne',
	'Default color': 'Couleur par défaut',
	'Dark, death, black, chaos, demon, ... evolution':
		'Évolution sombre, mort, noire, chaos, démon...',
	Fusion: 'Fusion',
	'Mode change': 'Changement de forme',
	'From a human': "Issu d'un humain",
	'Gold monster': 'Monstre doré',
	'Holy, angel evolution': 'Évolution sacrée, angélique',
	'Fire, lava made monster': 'Monstre de feu, de lave',
	'Ice, snow made monster': 'Monstre de glace, de neige',
	'Marine monster': 'Monstre marin',
	'Aerial, wind master monster': 'Monstre aérien, maître du vent',
	'Earth, rock monster': 'Monstre de terre, de roche',
	'Grass made monster': 'Monstre végétal',
	'Thunder, electric monster': 'Monstre de foudre, électrique',
	'Machine, metal made monster': 'Monstre machine, de métal',
	default: 'défaut',
	dark: 'sombre',
	fusion: 'fusion',
	mode: 'forme',
	human: 'humain',
	gold: 'doré',
	light: 'sacré',
	fire: 'feu',
	ice: 'glace',
	marine: 'marin',
	wind: 'vent',
	earth: 'terre',
	grass: 'végétal',
	electric: 'électrique',
	machine: 'machine',
};

const useTranslate = () => {
	const isFr = useContext(LanguageContext);
	const game = useContext(GameContext);

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
		(name: string): string =>
			(isFr &&
				((game && gameTranslatedSkills[game]?.[name]) || translatedSkills[name])) ||
			name,
		[isFr, game]
	);
	const translateTrait = useCallback(
		(name: string): string => (isFr && translatedTraits[name]) || name,
		[isFr]
	);
	const translateGame = (game: Game): string => gameTitle(game, isFr);

	return {
		isFr,
		translateMonster,
		translateUI,
		translateArea,
		translateMove,
		translateSkill,
		translateTrait,
		translateGame,
	};
};

export default useTranslate;
