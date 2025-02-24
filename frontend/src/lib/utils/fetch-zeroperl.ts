// SHHH look away BunnyCDN is being weird so I'm using this old one
const BASE_URL = 'https://sam2-model-download.b-cdn.net';
const zeroPerlUrl = `${BASE_URL}/zeroperl.wasm`;

async function fetchZeroPerl(): Promise<ArrayBuffer> {
	let wasmBuffer: ArrayBuffer | null = null;

	// Try to get from OPFS cache first
	try {
		const root = await navigator.storage.getDirectory();
		const wasmFile = await root.getFileHandle('zeroperl.wasm', { create: false });
		const file = await wasmFile.getFile();
		const buffer = await file.arrayBuffer();

		// Validate the buffer has content
		if (buffer.byteLength >= 8) {
			console.log('Found valid cached zeroperl.wasm');
			wasmBuffer = buffer;
		} else {
			console.log('Cached zeroperl.wasm is invalid');
		}
	} catch (error) {
		console.log('No cached zeroperl.wasm or error reading cache:', error);
	}

	// If no valid cached buffer, fetch from network
	if (!wasmBuffer) {
		console.log('Fetching zeroperl.wasm from internet');
		const response = await fetch(zeroPerlUrl);

		if (!response.ok) {
			throw new Error(`Failed to fetch zeroperl.wasm: ${response.status}`);
		}

		wasmBuffer = await response.arrayBuffer();
		await cacheWasmFile(wasmBuffer);
	}

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
