import { Fragment } from 'react';
import Icon from '@/components/Icon';
import LineGrid from '@/components/Line/LineGrid';
import { buildTrailLine, TRAIL_ZOOM } from '@/components/Monster/SynthesisTrail';
import { TrailNode } from '@/hooks/useSynthesisTrail';
import MockMonster from './MockMonster';

const METAL = 'Metal Slime';
const LIQUID = 'Liquid Metal Slime';
const KING = 'Metal King Slime';

const liquid: TrailNode = { name: LIQUID, parents: [{ name: METAL }, { name: METAL }] };
const { line } = buildTrailLine([{ name: KING, parents: [liquid, liquid] }]);

const steps = [[METAL, METAL], [LIQUID, LIQUID], [KING]];

const TrailMock = () => (
	<div className="home-mock home-trail-mock" aria-hidden="true">
		<div className="home-trail-preview">
			<LineGrid line={line} zoom={TRAIL_ZOOM} />
		</div>
		<div className="home-trail-bar">
			<span className="home-trail-button">
				<Icon name="chevron-down" />
			</span>
			<ol className="home-trail-steps">
				{steps.map((parents, i) => (
					<li key={i} className="home-trail-step">
						{i > 0 && <Icon name="chevron-right" className="home-trail-arrow" />}
						{parents.map((name, j) => (
							<Fragment key={j}>
								{j > 0 && <Icon name="plus-lg" className="home-trail-arrow" />}
								<MockMonster name={name} size="sm" />
							</Fragment>
						))}
					</li>
				))}
			</ol>
			<span className="home-trail-button">
				<Icon name="download" />
			</span>
			<span className="home-trail-button">
				<Icon name="x-lg" />
			</span>
		</div>
	</div>
);

export default TrailMock;
