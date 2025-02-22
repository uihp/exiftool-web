<script lang="ts">
	import { onMount } from 'svelte';
	import { WASI, WASIProcExit } from '@bjorn3/browser_wasi_shim';
	import { instantiate } from '../lib/asyncify.mjs';
	import { Fd } from '@bjorn3/browser_wasi_shim';
	import { PreopenDirectory, File } from '@bjorn3/browser_wasi_shim';

	let output = 'Loading ExifTool...';

	// Create a custom Fd implementation for stdout/stderr
	class CustomFd extends Fd {
		fd_write(data: Uint8Array): { ret: number; nwritten: number } {
			const text = new TextDecoder().decode(data);
			console.log('WASI output:', text);  // Debug output
			output += text;
			return { ret: 0, nwritten: data.length };
		}
	}


    const perlScript = `
use Image::ExifTool;
my $exif = Image::ExifTool->new();      

$exif->Options(Unknown => 1);  # Show unknown tags  

my $info = $exif->ImageInfo("test.jpeg");
if ($exif->GetValue("Error")) {
    print "Error: " . $exif->GetValue("Error") . "\\n";
} else {
    foreach my $tag (sort keys %$info) {
        my $val = $info->{$tag};
        print "$tag: $val\\n";
    }
}
`;
	async function runWasm() {
		try {
			// Fetch the JPEG file first
			const jpegResponse = await fetch('favicon.png');
			const jpegData = await jpegResponse.arrayBuffer();

			// Create WASI instance with stdin, stdout, stderr file descriptors
			const wasi = new WASI(
				['perl', '-e', perlScript],
				['LC_ALL=C'],
				[
					new CustomFd(), // stdin (fd 0)
					new CustomFd(), // stdout (fd 1) 
					new CustomFd(), // stderr (fd 2)
					new PreopenDirectory("/dev", new Map([
						["null", new File(new Uint8Array())]
					])),
					new PreopenDirectory(".", new Map([
						["favicon.png", new File(new Uint8Array(jpegData))]  // Use the actual JPEG data
					]))
				],
				{
					debug: true
				}
			);

			// Set up imports
			const imports = {
				wasi_snapshot_preview1: wasi.wasiImport
			};

			// In browser we'll need to fetch the wasm file
			const response = await fetch('zeroperl.wasm');
			const wasmBuffer = await response.arrayBuffer();
			
			console.log("Loading WASM...");
			const { instance } = await instantiate(wasmBuffer, imports);
			console.log("WASM loaded successfully");

			try {
				wasi.start(instance as { exports: { memory: WebAssembly.Memory; _start: () => void } });
			} catch (e) {
				if (e instanceof WASIProcExit) {
					console.log(`ExifTool exited with code ${e.code}`);
					if (e.code !== 0) {
						output += `\nExifTool exited with error code ${e.code}`;
					}
				} else {
					throw e;
				}
			}

		} catch (err) {
			console.error('Error running ExifTool:', err);
			output = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
		}
	}

	onMount(() => {
		runWasm();
	});
</script>

<main class="p-4">
	<pre class="font-mono bg-gray-100 p-2 rounded">{output}</pre>
</main>
