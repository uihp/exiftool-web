<script lang="ts">
	export let file: File | null;
	export let url: string | null;

	$: fileType = file?.type.toLowerCase() ?? '';
</script>

<div class="h-[200px] min-h-[200px] max-h-[200px] flex items-center justify-center">
	{#if file && url}
		{#if fileType.startsWith('image/')}
			{#if ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(fileType)}
				<img src={url} alt="Preview" class="h-[200px] object-scale-down rounded" />
			{:else}
				<div class="p-4 bg-gray-100 rounded overflow-auto h-[200px]">Cannot display a preview for this file format ({fileType}) on the web</div>
			{/if}
		{:else if fileType.startsWith('video/')}
			<video controls class="h-[200px] object-scale-down rounded">
				<source src={url} type={fileType} />
				<track kind="captions" label="English captions" src="" default />
				Your browser does not support the video tag.
			</video>
		{:else if fileType.startsWith('audio/')}
			<audio controls class="h-[200px]">
				<source src={url} type={fileType} />
				Your browser does not support the audio tag.
			</audio>
		{:else if fileType === 'application/pdf'}
			<iframe 
				src={url} 
				class="h-[200px] rounded"
				title="PDF Preview"
			></iframe>
		{:else}
			<div class="p-4 bg-gray-100 rounded overflow-auto h-[200px]">Cannot display a preview for this file type ({fileType})</div>
		{/if}
	{:else}
		<div class="text-gray-500 h-[200px]">No file selected</div>
	{/if}
</div>
