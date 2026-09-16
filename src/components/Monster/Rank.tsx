import Image from 'next/image';
import { memo } from 'react';
import { ranksIcons } from '@/consts/data';
import { makeClassName } from '@/functions';
import useTranslate from '@/hooks/useTranslate';

const Rank = memo(function Rank({
	name,
	className,
	big = false,
}: {
	name?: string;
	className?: string;
	big?: boolean;
}) {
	const { translateUI } = useTranslate();
	if (!name) return null;
	const icon = ranksIcons[name];
	if (!icon) {
		return <span className={makeClassName('rank-badge', className)}>{name}</span>;
	}
	const title = `${translateUI('Rank')} ${name}`;
	return (
		<Image
			className={makeClassName('rank-img', className)}
			src={`/images/ranks/${icon}`}
			alt={title}
			title={title}
			width={big ? 72 : 48}
			height={big ? 34 : 23}
		/>
	);
});

export default Rank;
