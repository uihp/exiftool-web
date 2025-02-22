<script lang="ts">
    import type { ParsedOutput } from "$lib/types/parsed-output";
    import Preview from "./file-preview.svelte";

    export let fileUrl: string;
    export let currentFile: File | null;
    export let output: ParsedOutput;
</script>

<div class="w-[65%] flex flex-col gap-4 max-h-[600px] overflow-auto bg-gray-100 border border-gray-300 rounded p-4">
    {#if currentFile}
        <div class="flex justify-center">
            <Preview file={currentFile} url={fileUrl} />
        </div>
        <div class="w-full overflow-auto transition-all duration-300 ease-in-out opacity-0 {fileUrl ? 'opacity-100' : ''} min-h-[200px]">
            {#if output?.length > 0}
                <div class="grid grid-cols-2 gap-2 font-mono">
                    {#each output as {label, value}}
                        <div class="font-semibold">{label}</div>
                        <div>{value}</div>
                    {/each}
                </div>
            {:else}
                <div class="flex justify-center items-center h-full text-gray-500 font-mono">
                    exiftool could not properly be run on this file.
                </div>
            {/if}
        </div>
    {:else}
        <div class="flex justify-center items-center h-[200px] text-gray-500">
            Preview will appear here
        </div>
    {/if}
</div>