import React from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { DISCORD_URL } from '@/consts/env';
import useTranslate from '@/hooks/useTranslate';

const ReportABugLink: React.FC = () => {
	const { translateUI } = useTranslate();
	return (
		<Button
			as="a"
			href={DISCORD_URL}
			target="_blank"
			rel="nofollow noopener noreferrer"
			title="discord"
			color="primary"
		>
			<Icon name="bug-fill" /> <span className="mx-1">{translateUI('Report a bug')}</span>{' '}
			<Icon name="discord" />
		</Button>
	);
};
export default ReportABugLink;
