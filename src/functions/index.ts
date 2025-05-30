export const typeOf = (value: any): string => {
	if (value === null) return 'null';
	if (Array.isArray(value)) return 'array';
	return typeof value;
};

export const camelToKebab = (str: string): string =>
	str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export const makeClassName = (...classList: any[]): string =>
	classList.reduce((classList: string, className: any) => {
		if (!className) return classList;
		if (Array.isArray(className)) className = makeClassName(...className);
		if (typeof className === 'object') {
			Object.entries(className).forEach(([key, value]) => {
				if (value) classList += ' ' + camelToKebab(key);
			});
			return classList;
		}
		if (!classList) return className;
		return classList + ' ' + className;
	}, '');

export const capitalize = (string: string): string => {
	const strings = string.split('_');
	if (strings.length > 1) {
		return strings.map(capitalize).join(' ');
	}
	return string[0].toUpperCase() + string.slice(1);
};

export const processLanguage = () => {
	const language: string = navigator.language || (navigator as any).userLanguage;
	const [p1, p2] = language.split('-');
	if (p1 == 'fr' || p2 == 'FR') return true;
	return false;
};

export const objectToGETparams = (
	object: object,
	baseParams: string = '',
	parentKey: string
): string => {
	return Object.entries(object).reduce((params, [key, value]) => {
		if (value === undefined) return params;
		if (typeof value === 'object' && !Array.isArray(value)) {
			return objectToGETparams(value, params, key);
		}
		if (parentKey) {
			key = `${parentKey}[${key}]`;
		}
		return `${params}${params ? '&' : '?'}${key}=${encodeURIComponent(value)}`;
	}, baseParams);
};

export function objectCompare(
	object1: Record<any, any> | null,
	object2: Record<any, any> | null
) {
	if (object1 == null && object2 == null) {
		return true;
	} else if (object1 == null || object2 == null) {
		return false;
	}
	if (Object.keys(object1).length !== Object.keys(object2).length) {
		return false;
	}
	for (let [key, value] of Object.entries(object1)) {
		// compare arrays as objects
		if (typeof value === 'object' && typeof object2[key] === 'object') {
			if (!objectCompare(value, object2[key])) {
				return false;
			}
		} else if (value !== object2[key]) {
			return false;
		}
	}
	return true;
}

export const stringToKey = (string: string): string =>
	string
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\s\-_.'’:?%\u0300-\u036f]/g, '')
		.toLowerCase();
