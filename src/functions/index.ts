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

export const stringToKey = (string: string): string =>
	string.toLowerCase().replace(/[\s\-'_]*/g, '');

export const getSearchPriority = (search: string, name: string): number | null => {
	name = stringToKey(name);
	search = stringToKey(search);
	let index = name.startsWith(search)
		? 0
		: search.length > 3
		? name.indexOf(search)
		: -1; //name string contains search string
	if (index === -1) return null;
	let priority: number = index * -1;
	priority -= Math.abs(name.length - search.length);
	return priority;
};
