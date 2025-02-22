<script lang="ts">
	import type { ParsedOutput } from "$lib/types/parsed-output";
	import { runExifTools } from "$lib/utils/run-exif-tools";

	let output: ParsedOutput;
	let dropzone: HTMLDivElement;
	let isDragging = false;
	let fileInput: HTMLInputElement;
	let imageUrl: string | null = null;

	// Create a custom Fd implementation for stdout/stderr

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
			imageUrl = URL.createObjectURL(files[0]);
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
			imageUrl = URL.createObjectURL(files[0]);
			output = await runExifTools(files[0]);
		}
	}

</script>

<main class="p-4">
	<div class="flex gap-4">
		<div class="w-1/3">
			<input
				type="file"
				accept="image/*"
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
				Drop an image file here or click to select
			</div>
			{#if imageUrl}
				<div class="mt-4">
					<img src={imageUrl} alt="Display" class="max-w-full rounded" />
				</div>
			{/if}
		</div>
		<div class="w-2/3 overflow-auto">
			{#if output?.length > 0}
				<div class="grid grid-cols-2 gap-2 font-mono bg-gray-100 p-2 rounded">
					{#each output as {label, value}}
						<div class="font-semibold">{label}</div>
						<div>{value}</div>
					{/each}
				</div>
			{:else}
				<pre class="font-mono bg-gray-100 p-2 rounded">{output}</pre>
			{/if}
		</div>
	</div>
</main>
