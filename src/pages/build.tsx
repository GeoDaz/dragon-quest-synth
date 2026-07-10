import React, { useState, useReducer, useMemo } from 'react';
import Layout from '@/components/Layout';
import ZoomBar from '@/components/ZoomBar';
import ColorLegend from '@/components/ColorLegend';
import LineGrid from '@/components/Line/LineGrid';
import { GetStaticProps } from 'next';
import { SearchContext } from '@/context/search';
import lineReducer, { defaultLine, setLineAction } from '@/reducers/lineReducer';
import Icon from '@/components/Icon';
import BoostrapSwitch from '@/components/BoostrapSwitch';
import { Alert, Button, FormControl, InputGroup } from 'react-bootstrap';
import ReportABugLink from '@/components/ReportABugLink';
import useLocalStorage from '@/hooks/useLocalStorage';
import DownloadDropdown from '@/components/DownloadDropdown';
import Line from '@/types/Line';
import UploadCode from '@/components/UploadCode';
import { areCollapsablePoints } from '@/functions/line';
import useDownloadImg from '@/hooks/useDownloadImg';
import useDownloadCode from '@/hooks/useDownloadCode';
import { ImagesContext } from '@/context/images';
import { ZoomProvider } from '@/context/zoom';
import { DEFAULT_ZOOM } from '@/consts/zooms';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';
import { getDubbedSearchList } from '@/functions/search';

interface Props {
	images: StringObject;
	search: Search;
}
const PageBuild: React.FC<Props> = ({ images = {}, search }) => {
	const [line, dispatchState] = useReducer(lineReducer, defaultLine);
	const setLine = (line: Line) => dispatchState(setLineAction(line));
	const { setItemToStorage } = useLocalStorage('line', line, setLine);
	const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
	const [edition, edit] = useState<boolean>(true);
	useMemo(() => areCollapsablePoints(line), [line]);

	const { downloadCode, uploadCode, name, setName } = useDownloadCode(line, setLine);
	const { downloadImage, downloading, error } = useDownloadImg(name);

	const handleUpdate = (action: CallableFunction, ...args: any[]) => {
		dispatchState(action(...args));
	};

	const handleVoid = () => {
		setLine(defaultLine);
		// default value is not automaticaly stored in localstorage
		setItemToStorage(defaultLine);
	};

	const handeDowloadImg = () => {
		const editionState = edition;
		const zoomState = zoom;
		edit(false);
		setZoom(DEFAULT_ZOOM);
		downloadImage(line, DEFAULT_ZOOM).then(() => {
			edit(editionState);
			setZoom(zoomState);
		});
	};

	return (
		<Layout
			title="Make your synthesis three"
			metatitle="Builder"
			metadescription="Make your own Dragon Quest synthesis threes. Be creative your are free."
		>
			<blockquote className="blockquote">
				<b>Click</b> on a case from the grid to set a Monster. The{' '}
				<Icon name="bezier2" title="link" /> button lets you link two monsters
				together.
				<br /> The <b>Save as</b> button lets you export the line as an image or as
				code. The image export works with <b>uploaded images</b> and <b>URL images</b>.
				<br /> Your work is saved on the browser for one line at a time but you can
				export it on your computer with the <b>Save as Code</b> button and rework it
				later with the <b>Import</b> button.
			</blockquote>
			<div className="line-filters align-items-center">
				<BoostrapSwitch
					checked={edition}
					labelOn={
						<>
							Edit <Icon name="pencil-fill" />
						</>
					}
					labelOff={
						<>
							<Icon name="eye-fill" /> View
						</>
					}
					toggle={() => edit(!edition)}
				/>
				<Button
					variant="danger"
					disabled={line === defaultLine}
					onClick={handleVoid}
				>
					<Icon name="trash3-fill" /> Void
				</Button>
				<InputGroup className="width-auto d-inline-flex">
					<InputGroup.Text>Line title</InputGroup.Text>
					<FormControl
						id="line-title"
						max="100"
						onChange={e => setName(e.target.value)}
						value={name || ''}
						placeholder="_ _ _ _ _"
					/>
				</InputGroup>
				<DownloadDropdown
					downloadCode={downloadCode}
					downloadImage={handeDowloadImg}
					loading={downloading}
					error={error}
				/>
				<UploadCode handleUpload={uploadCode} />
				<ReportABugLink />
				<ZoomBar handleZoom={setZoom} />
				<ColorLegend />
			</div>
			{!!error && (
				<div>
					<Alert variant="danger">{error}</Alert>
				</div>
			)}
			<SearchContext.Provider value={search}>
				<ImagesContext.Provider value={images}>
					<ZoomProvider zoom={zoom}>
						<LineGrid
							line={line}
							handleUpdate={edition ? handleUpdate : undefined}
						/>
					</ZoomProvider>
				</ImagesContext.Provider>
			</SearchContext.Provider>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const images = require('../json/monstersImages.json');
		const translatedMonsters = require('../json/monsterTranslations.json');
		const searchList: string[] = Object.keys(images);
		const search: Search = getDubbedSearchList(searchList, translatedMonsters);

		return { props: { images, search } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageBuild;
