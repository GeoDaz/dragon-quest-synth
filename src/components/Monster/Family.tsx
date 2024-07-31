import { familiesIcons } from '@/consts/data';
import Image from 'next/image';
import AnchorLink from '../AnchorLink';
import useTranslate from '@/hooks/useTranslate';
import { memo } from 'react';

const Family = memo(function Family({
	name,
	big = false,
	handleActive,
}: {
	name: string;
	big?: boolean;
	handleActive?: CallableFunction;
}) {
	const { translateUI } = useTranslate();
	const icon = familiesIcons[name];
	if (!icon) return null;
	const title = translateUI(name);
	const img = (
		<Image
			className="family"
			src={`/images/family/${icon}`}
			alt={title}
			title={title}
			height={big ? 45 : 30}
			width={big ? 45 : 30}
		/>
	);
	if (handleActive) {
		return <AnchorLink hash={name}>{img}</AnchorLink>;
	}
	return img;
});

export default Family;
