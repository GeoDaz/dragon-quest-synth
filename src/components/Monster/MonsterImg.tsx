import { makeClassName } from '@/functions';
import { Monster } from '@/types/Monster';
import Image from 'next/image';

const MonsterImg = ({
	monster,
	small = false,
	className,
}: {
	monster: Monster;
	small?: boolean;
	className?: string;
}) => {
	const size = small ? 45 : 90;
	return (
		<Image
			src={monster.img}
			alt={monster.name}
			title={monster.name}
			height={size}
			width={size}
			className={makeClassName(`w-${size}px h-${size}px`, className)}
		/>
	);
};

export default MonsterImg;
