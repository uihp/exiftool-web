// SHHH look away BunnyCDN is being weird so I'm using this old one
const BASE_URL = 'https://sam2-model-download.b-cdn.net';
const zeroPerlUrl = `${BASE_URL}/zeroperl.wasm`;

async function fetchZeroPerl(): Promise<ArrayBuffer> {
	let cachedWasm;

	// Try to get from OPFS cache first
	try {
		const root = await navigator.storage.getDirectory();
		const wasmFile = await root.getFileHandle('zeroperl.wasm', { create: false });
		cachedWasm = await wasmFile.getFile();
		console.log('Found cached zeroperl.wasm');
	} catch (error) {
		console.log('No cached zeroperl.wasm. Error:', error);
	}

	if (cachedWasm) {
		console.log('Using cached zeroperl.wasm');
		return cachedWasm.arrayBuffer();
	}

	// Fetch from internet if not cached
	console.log('Fetching zeroperl.wasm from internet');
	const response = await fetch(zeroPerlUrl);

	if (!response.ok) {
		throw new Error(`Failed to fetch zeroperl.wasm: ${response.status}`);
	}

	const wasmBuffer = await response.arrayBuffer();
	await cacheWasmFile(wasmBuffer);
	return wasmBuffer;
}

// Helper function to cache wasm file
async function cacheWasmFile(wasmBuffer: ArrayBuffer) {
	try {
		const root = await navigator.storage.getDirectory();
		const wasmFile = await root.getFileHandle('zeroperl.wasm', { create: true });
		const writable = await wasmFile.createWritable();
		await writable.write(wasmBuffer);
		await writable.close();
		console.log('Cached zeroperl.wasm');
	} catch (error) {
		console.error('Failed to cache zeroperl.wasm:', error);
	}
}

export { fetchZeroPerl };
