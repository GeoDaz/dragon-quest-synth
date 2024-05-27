import LineImage, { LineImageProps } from '../Line/LineImage';

interface MonsterImgProps extends LineImageProps {
	small?: boolean;
}
const MonsterImg = ({ small = false, ...props }: MonsterImgProps) => {
	const size = (small ? 45 : 90) - 6;
	return (
		<div className="line-point-safe-zone">
			<LineImage height={size} width={size} {...props} />
		</div>
	);
};

export default MonsterImg;
