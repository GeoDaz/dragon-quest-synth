import { FiltersContext } from '@/context/filter';
import Link from '@/components/Link';
import { useContext } from 'react';

interface AnchorLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	hash: string;
	/** Runs before the hash change. `onClick` cannot be used for that: the props
	 * spread below would replace the handler that performs the navigation. */
	onNavigate?: () => void;
	children: React.ReactNode;
}
const AnchorLink = ({ hash, onNavigate, children, ...props }: AnchorLinkProps) => {
	const { resetFilters, navigate } = useContext(FiltersContext);

	const onClick = (e: any) => {
		e.preventDefault();

		if (onNavigate) onNavigate();
		if (resetFilters) resetFilters();
		if (navigate) navigate(hash);
	};

	return (
		<Link href={`#${hash}`} onClick={onClick} {...props}>
			{children}
		</Link>
	);
};
export default AnchorLink;
