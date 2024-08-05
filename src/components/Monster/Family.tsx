import { familiesIcons } from '@/consts/data';
import Image from 'next/image';
import AnchorLink from '../AnchorLink';
import useTranslate from '@/hooks/useTranslate';
import { memo } from 'react';
import { makeClassName } from '@/functions';

const Family = memo(function Family({
	name,
	big = false,
	activable = false,
	className,
	rank,
}: {
	name: string;
	big?: boolean;
	activable?: boolean;
	className?: string;
	rank?: string;
}) {
	const { translateUI } = useTranslate();
	const icon = familiesIcons[name];
	if (!icon) return null;
	const title = translateUI(name);
	const img = (
		<Image
			className={makeClassName('family', className)}
			src={`/images/family/${icon}`}
			alt={title}
			title={title}
			height={big ? 47 : 30}
			width={big ? 48 : 30}
		/>
	);
	if (activable) {
		return <AnchorLink hash={name + (rank ? `-${rank}` : '')}>{img}</AnchorLink>;
	}
	return img;
});

export default Family;
