import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Pivot = { family: string; top: number };

const useFamilyAccordion = (families: string[]) => {
	const signature = families.join('|');
	const [state, setState] = useState<{ signature: string; family: string | null }>(
		() => ({ signature, family: families[0] ?? null })
	);
	const open =
		families.length === 1 ? families[0]
		: state.signature === signature ? state.family
		: (families[0] ?? null);

	const headersRef = useRef<Map<string, HTMLElement>>(new Map());
	const familiesRef = useRef(families);
	const signatureRef = useRef(signature);
	const openRef = useRef(open);
	const pivotRef = useRef<Pivot | null>(null);
	familiesRef.current = families;
	signatureRef.current = signature;
	openRef.current = open;

	const registerHeader = useCallback((family: string, el: HTMLElement | null) => {
		if (el) headersRef.current.set(family, el);
		else headersRef.current.delete(family);
	}, []);

	const headerTop = (family: string | undefined) => {
		const el = family ? headersRef.current.get(family) : undefined;
		return el ? el.getBoundingClientRect().top : undefined;
	};

	const change = (family: string | null, pivot?: string) => {
		const top = headerTop(pivot);
		pivotRef.current = pivot && top !== undefined ? { family: pivot, top } : null;
		setState({ signature: signatureRef.current, family });
	};

	const toggle = (family: string) => {
		if (familiesRef.current.length === 1) return;
		change(openRef.current === family ? null : family, family);
	};

	const openFamily = (family: string) => {
		if (openRef.current === family) return;
		change(family);
	};

	useIsomorphicLayoutEffect(() => {
		const pivot = pivotRef.current;
		pivotRef.current = null;
		if (!pivot) return;
		const top = headerTop(pivot.family);
		const delta = top === undefined ? 0 : top - pivot.top;
		if (Math.abs(delta) > 1) window.scrollBy(0, delta);
	}, [open]);

	return useMemo(
		() => ({ open, toggle, openFamily, registerHeader }),
		[open, registerHeader]
	);
};

export default useFamilyAccordion;
