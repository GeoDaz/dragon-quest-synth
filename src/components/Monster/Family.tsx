import { familiesIcons } from '@/consts/data';
import Image from 'next/image';

const Family = ({ name, big = false }: { name: string; big?: boolean }) => {
	const icon = familiesIcons[name];
	if (!icon) return null;
	return (
		<Image
			className="family"
			src={`/images/family/${icon}`}
			alt={name}
			title={name}
			height={big ? 45 : 30}
			width={big ? 45 : 30}
		/>
	);
};

export default Family;
