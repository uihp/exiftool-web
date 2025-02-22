<script lang="ts">
	import { onMount } from 'svelte';
	import { WASI, WASIProcExit } from '@bjorn3/browser_wasi_shim';
	import { instantiate } from '../lib/asyncify.mjs';
	import { Fd } from '@bjorn3/browser_wasi_shim';
	import { PreopenDirectory, File } from '@bjorn3/browser_wasi_shim';

	let output = 'Loading ExifTool...';
	let dropzone: HTMLDivElement;
	let isDragging = false;

	// Create a custom Fd implementation for stdout/stderr
	class CustomFd extends Fd {
		fd_write(data: Uint8Array): { ret: number; nwritten: number } {
			const text = new TextDecoder().decode(data);
			console.log('WASI output:', text);  // Debug output
			output += text;
			return { ret: 0, nwritten: data.length };
		}
	}



	async function runWasm() {
		try {
			// Fetch the JPEG file first
            const fileName = 'favicon.png';
            const imageResponse = await fetch(fileName);
			const imageData = await imageResponse.arrayBuffer();

            const perlScript = `
            use Image::ExifTool;
            my $exif = Image::ExifTool->new();      

            $exif->Options(Unknown => 1);  # Show unknown tags  

            my $info = $exif->ImageInfo("${fileName}");
            if ($exif->GetValue("Error")) {
                print "Error: " . $exif->GetValue("Error") . "\\n";
            } else {
                foreach my $tag (sort keys %$info) {
                    my $val = $info->{$tag};
                    print "$tag: $val\\n";
                }
            }
            `;

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
						[fileName, new File(new Uint8Array(imageData))]  // Use the actual JPEG data
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
	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			console.log('Files dropped:', files);
			// TODO: Handle the dropped files
		}
	}

	function handleClick() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = (e) => {
			const files = (e.target as HTMLInputElement).files;
			if (files && files.length > 0) {
				console.log('Files selected:', files);
				// TODO: Handle the selected files
			}
		};
		input.click();
	}

	onMount(() => {
		runWasm();
	});
</script>

<main class="p-4">
	<div
		bind:this={dropzone}
		class="border-2 border-dashed p-8 mb-4 rounded text-center cursor-pointer transition-colors {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}"
		on:dragenter={handleDragEnter}
		on:dragleave={handleDragLeave}
		on:dragover|preventDefault
		on:drop={handleDrop}
		on:click={handleClick}
		on:keydown={handleClick}
		role="button"
		tabindex="0"
	>
		Drop image files here or click to browse
	</div>
	<pre class="font-mono bg-gray-100 p-2 rounded">{output}</pre>
</main>
