<script lang="ts">
    import type { ParsedOutput } from "$lib/types/parsed-output";

    export let fileUrl: string;
    export let currentFile: File | null;
    export let output: ParsedOutput;
</script>

<div class="w-full md:w-[65%] flex flex-col gap-4 max-h-[300px] md:max-h-[600px] md:min-w-[550px] overflow-auto bg-gray-100 border border-gray-300 rounded px-5 pb-5 pt-2.5">
    <h2 class="text-lg md:text-2xl md:py-3 py-2 font-mono font-extrabold">Metadata</h2>
    {#if currentFile}
        <div class="w-full overflow-auto transition-all duration-300 ease-in-out opacity-0 {fileUrl ? 'opacity-100' : ''} min-h-[200px]">
            {#if output?.length > 0}
                <div class="flex flex-col gap-1 md:grid md:grid-cols-2 md:gap-2 font-mono text-xs lg:text-base md:text-base">
                    {#each output as {label, value}}
                        <div class="font-semibold">{label}</div>
                        <div class="mb-2 md:mb-0">{value}</div>
                    {/each}
                </div>
            {:else}
                <div class="flex justify-center items-center h-full text-gray-500 font-mono text-sm md:text-base">
                    exiftool could not properly be run on this file.
                </div>
            {/if}
        </div>
    {:else}
        <div class="flex justify-center items-center h-[200px] text-gray-500 text-sm md:text-base">
            Preview will appear here
        </div>
    {/if}
</div>