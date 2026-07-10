import { copyToClipboard } from '@/functions';
import { createFile, downloadFile } from '@/functions/file';
import transformLine, { prepareLineExport } from '@/functions/line';
import { defaultLine } from '@/reducers/lineReducer';
import Line from '@/types/Line';
import { useState } from 'react';

const useDownloadCode = (line: Line, setLine: (line: Line) => void) => {
	const [name, setName] = useState<string | undefined>();

	const downloadCode = () => {
		const exportedLine = prepareLineExport(line);
		const json = JSON.stringify(exportedLine, null, 4);
		copyToClipboard(json);
		const file = createFile(json, 'application/json');
		downloadFile(file, (name || 'line') + '.json');
	};

	const uploadCode = (name: string, json: Line | null) => {
		setName(name);
		setLine(json ? (transformLine(json) as Line) : defaultLine);
	};

	return { downloadCode, uploadCode, name, setName };
};

export default useDownloadCode;
