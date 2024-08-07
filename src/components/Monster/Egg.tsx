import Image from 'next/image';
import useTranslate from '@/hooks/useTranslate';

const Egg = ({ name }: { name: string }) => {
	const { translateUI } = useTranslate();

	const title = translateUI(name);
	return (
		<Image
			src={`/images/eggs/${name}.png`}
			alt={title}
			title={title}
			height={30}
			width={30}
		/>
	);
};

export default Egg;
