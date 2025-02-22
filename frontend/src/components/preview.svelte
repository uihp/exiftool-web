<script lang="ts">
	export let file: File | null;
	export let url: string | null;

	$: fileType = file?.type.toLowerCase() ?? '';
</script>

{#if file && url}
	{#if fileType.startsWith('image/')}
		{#if ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(fileType)}
			<img src={url} alt="Preview" class="max-w-full max-h-[200px] w-auto h-auto object-scale-down rounded" />
		{:else}
			<div class="p-4 bg-gray-100 rounded max-h-[200px] overflow-auto scale-90">Cannot display a preview for this file format ({fileType}) on the web</div>
		{/if}
	{:else if fileType.startsWith('video/')}
		<video controls class="max-w-full max-h-[200px] w-auto h-auto object-scale-down rounded">
			<source src={url} type={fileType} />
			<track kind="captions" label="English captions" src="" default />
			Your browser does not support the video tag.
		</video>
	{:else if fileType.startsWith('audio/')}
		<audio controls class="w-full max-h-[200px] scale-90">
			<source src={url} type={fileType} />
			Your browser does not support the audio tag.
		</audio>
	{:else if fileType === 'application/pdf'}
		<iframe 
			src={url} 
			class="w-full h-[200px] scale-90 rounded"
			title="PDF Preview"
		></iframe>
	{:else}
		<div class="p-4 bg-gray-100 rounded max-h-[200px] overflow-auto scale-90">Cannot display a preview for this file type ({fileType})</div>
	{/if}
{/if}
