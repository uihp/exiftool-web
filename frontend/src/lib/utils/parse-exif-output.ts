function parseExifOutput(text: string): { label: string; value: string }[] {
	return text
		.split('\n')
		.filter((line) => line.includes(':'))
		.map((line) => {
			const [label, ...valueParts] = line.split(':');
			return {
				label: label.trim(),
				value: valueParts.join(':').trim()
			};
		});
}

export { parseExifOutput };
