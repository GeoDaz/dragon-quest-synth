import LineImage from '@/components/Line/LineImage';
import useTranslate from '@/hooks/useTranslate';
import { makeClassName } from '@/functions';

const MockMonster = ({
	name,
	size = 'md',
	missing = false,
}: {
	name: string;
	size?: 'xs' | 'sm' | 'md';
	missing?: boolean;
}) => {
	const { translateMonster } = useTranslate();
	return (
		<span className={makeClassName('home-mon', `home-mon-${size}`, missing && 'missing')}>
			<LineImage name={name} title={translateMonster(name)} loadable={false} />
		</span>
	);
};

export default MockMonster;
