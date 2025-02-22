<script lang="ts">
	import type { ParsedOutput } from "$lib/types/parsed-output";
	import { runExifTools } from "$lib/utils/run-exif-tools";
	import Preview from "../components/preview.svelte";

	let output: ParsedOutput;
	let dropzone: HTMLDivElement;
	let isDragging = false;
	let fileInput: HTMLInputElement;
	let fileUrl: string | null = null;
	let currentFile: File | null = null;

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			console.log('Files dropped:', files);
			currentFile = files[0];
			fileUrl = URL.createObjectURL(files[0]);
			output = await runExifTools(files[0]);
		}
	}

	function handleClick() {
		fileInput.click();
	}

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			currentFile = files[0];
			fileUrl = URL.createObjectURL(files[0]);
			output = await runExifTools(files[0]);
		}
	}

</script>
<main class="py-16 px-32 flex flex-col gap-8">
    <div class="flex flex-col gap-6"> 
	<h1 class="text-4xl font-['Roboto'] font-bold">exiftool</h1>
	<p class="max-w-2xl">
		View the source code (or contribute, flag issues, etc) <a href="https://github.com/lucasgelfond/exiftool-web" class="text-blue-600 underline">here</a>. Based on <a href="https://exiftool.org/" class="text-blue-600 underline">exiftool</a>, <a href="https://github.com/uswriting/zeroperl" class="text-blue-600 underline">zeroperl</a>, and <a href="https://github.com/bjorn3/browser_wasi_shim" class="text-blue-600 underline">browser_wasi_shim</a>. Made with ❤️ in San Francisco by <a href="http://lucasgelfond.online" class="text-blue-600 underline">Lucas Gelfond</a>.
	</p>
    </div>
    <div class="flex gap-8">
        <div class="w-[35%]">
            <input
                type="file"
                accept="*/*"
                class="hidden"
                bind:this={fileInput}
                on:change={handleFileSelect}
            />
            <div
                bind:this={dropzone}
                class="border-2 border-dashed p-4 rounded text-center cursor-pointer transition-colors {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}"
                on:dragenter={handleDragEnter}
                on:dragleave={handleDragLeave}
                on:dragover|preventDefault
                on:drop={handleDrop}
                on:click={handleClick}
                on:keydown={e => e.key === 'Enter' && handleClick()}
                role="button"
                tabindex="0"
            >
                {fileUrl ? 'Upload more files' : 'Drop a file here or click to select'}
            </div>
        </div>
        {#if fileUrl}
            <div class="w-[65%] flex flex-col gap-4 max-h-[600px] overflow-auto bg-gray-100 border border-gray-300 rounded p-4">
                <div class="flex justify-center">
                    <Preview file={currentFile} url={fileUrl} />
                </div>
                <div class="w-full overflow-auto transition-all duration-300 ease-in-out opacity-0 {fileUrl ? 'opacity-100' : ''}">
                    {#if output?.length > 0}
                        <div class="grid grid-cols-2 gap-2 font-mono">
                            {#each output as {label, value}}
                                <div class="font-semibold">{label}</div>
                                <div>{value}</div>
                            {/each}
                        </div>
                    {:else}
                        <pre class="font-mono">{output}</pre>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</main>
