<script lang="ts">
	import type { ParsedOutput } from "$lib/types/parsed-output";
	import { runExifTools } from "$lib/utils/run-exif-tools";
	import FileDisplay from "../components/file-display.svelte";
	import FilePreview from "../components/file-preview.svelte";

	let output: ParsedOutput;
	let dropzone: HTMLDivElement;
	let isDragging = false;
	let fileInput: HTMLInputElement;
	let fileUrl: string | null = null;
	let currentFile: File | null = null;
	let files: File[] = [];

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
		const droppedFiles = e.dataTransfer?.files;
		if (droppedFiles && droppedFiles.length > 0) {
			files = [...files, ...Array.from(droppedFiles)];
			if (!currentFile) {
				await selectFile(files[0]);
			}
		}
	}

	function handleClick() {
		fileInput.click();
	}

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const selectedFiles = target.files;
		if (selectedFiles && selectedFiles.length > 0) {
			files = [...files, ...Array.from(selectedFiles)];
			if (!currentFile) {
				await selectFile(files[0]);
			}
		}
		// Reset input so the same file can be selected again
		target.value = '';
	}

	async function selectFile(file: File) {
		currentFile = file;
		if (fileUrl) {
			URL.revokeObjectURL(fileUrl);
		}
		fileUrl = URL.createObjectURL(file);
		output = await runExifTools(file);
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

</script>
<main class="py-16 px-32 flex flex-col gap-8 font-mono">
    <div class="flex flex-col gap-6"> 
        <h1 class="text-4xl font-mono font-bold">exiftool</h1>
        <p class="max-w-2xl min-w-[600px]">
            View the source code (or contribute, flag issues, etc) <a href="https://github.com/lucasgelfond/exiftool-web" class="text-blue-600 underline">here</a>. Based on <a href="https://exiftool.org/" class="text-blue-600 underline">exiftool</a>, <a href="https://github.com/uswriting/zeroperl" class="text-blue-600 underline">zeroperl</a>, and <a href="https://github.com/bjorn3/browser_wasi_shim" class="text-blue-600 underline">browser_wasi_shim</a>. Made with ❤️ in San Francisco by <a href="http://lucasgelfond.online" class="text-blue-600 underline">Lucas Gelfond</a>.
        </p>
    </div>

    <input
        type="file"
        accept="*/*"
        class="hidden"
        bind:this={fileInput}
        on:change={handleFileSelect}
        multiple
    />

    {#if files.length === 0}
        <div
            bind:this={dropzone}
            class="h-[600px] min-w-[600px] border-2 border-dashed rounded flex items-center justify-center cursor-pointer transition-colors {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}"
            on:dragenter={handleDragEnter}
            on:dragleave={handleDragLeave}
            on:dragover|preventDefault
            on:drop={handleDrop}
            on:click={handleClick}
            on:keydown={e => e.key === 'Enter' && handleClick()}
            role="button"
            tabindex="0"
        >
            <p class="text-xl">Drop files here or click to select</p>
        </div>
    {:else}
        <div class="flex gap-8">
            <div class="w-[25%] min-w-[200px] flex flex-col gap-4 h-[600px]">
                {#if currentFile && fileUrl}
                    <FilePreview file={currentFile} url={fileUrl} />
                {/if}

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
                    Add more files
                </div>

                <div class="flex flex-col gap-2 overflow-auto">
                    {#each files as file}
                        <button
                            class="flex flex-col gap-1 p-3 text-left border rounded hover:bg-gray-50 transition-colors {file === currentFile ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}"
                            on:click={() => selectFile(file)}
                        >
                            <div class="font-mono truncate">{file.name}</div>
                            <div class="text-sm text-gray-500 font-mono">
                                <div>{file.type || 'Unknown type'}</div>
                                <div>{formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}</div>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
            {#if fileUrl}
                <FileDisplay {fileUrl} currentFile={currentFile} {output} />
            {/if}
        </div>
    {/if}
</main>
