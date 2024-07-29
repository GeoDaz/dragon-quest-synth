import { familiesIcons } from '@/consts/data';
import Image from 'next/image';
import Link from 'next/link';
import AnchorLink from '../AnchorLink';

const Family = ({
	name,
	big = false,
	handleActive,
}: {
	name: string;
	big?: boolean;
	handleActive?: CallableFunction;
}) => {
	const icon = familiesIcons[name];
	if (!icon) return null;
	const img = (
		<Image
			className="family"
			src={`/images/family/${icon}`}
			alt={name}
			title={name}
			height={big ? 45 : 30}
			width={big ? 45 : 30}
		/>
	);
	if (handleActive) {
		return <AnchorLink hash={name}>{img}</AnchorLink>;
	}
	return img;
};

export default Family;
