<script lang="ts">
	export let file: File | null;
	export let url: string | null;

	$: fileType = file?.type.toLowerCase() ?? '';
</script>

<div class="h-[200px] min-w-[200px] min-h-[200px] max-h-[200px] flex items-center justify-center bg-gray-100 rounded">
	{#if file && url}
		{#if fileType.startsWith('image/')}
			{#if ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(fileType)}
				<div class="p-5 flex items-center justify-center w-full h-full min-w-[200px]">
					<img src={url} alt="Preview" class="h-[160px] object-scale-down rounded" />
				</div>
			{:else}
				<div class="p-5 flex items-center justify-center w-full h-full min-w-[200px]">
					<div class="rounded overflow-auto">Cannot display a preview for this file format ({fileType}) on the web</div>
				</div>
			{/if}
		{:else if fileType.startsWith('video/')}
			<div class="p-5 flex items-center justify-center w-full h-full min-w-[200px]">
				<video controls class="h-[160px] object-scale-down rounded">
					<source src={url} type={fileType} />
					<track kind="captions" label="English captions" src="" default />
					Your browser does not support the video tag.
				</video>
			</div>
		{:else if fileType.startsWith('audio/')}
			<div class="p-5 flex items-center justify-center w-full h-full min-w-[200px]">
				<audio controls class="w-full">
					<source src={url} type={fileType} />
					Your browser does not support the audio tag.
				</audio>
			</div>
		{:else if fileType === 'application/pdf'}
			<div class="p-5 flex items-center justify-center w-full h-full min-w-[200px]">
				<iframe 
					src={url} 
					class="h-[160px] rounded"
					title="PDF Preview"
				></iframe>
			</div>
		{:else}
			<div class="p-5 flex items-center justify-center w-full h-full min-w-[200px]">
				<div class="rounded overflow-auto">Cannot display a preview for this file type ({fileType})</div>
			</div>
		{/if}
	{:else}
		<div class="p-5 flex items-center justify-center w-full h-full min-w-[200px]">
			<div class="text-gray-500">No file selected</div>
		</div>
	{/if}
</div>
