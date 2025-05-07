<script lang="ts">
    import { Application } from "pixi.js";
    import { getPixiContext, setPixiContext } from "../pixi";
    import { onMount } from "svelte";
	import { gridSize } from "$lib/solution";
	import { Tile } from "./Tile";

    // Local state
    let container: HTMLDivElement;
    let app: Application;
    
    // Setup context
    const context = setPixiContext(new Application());
    app = context.app;

    onMount(() => {

        async function init() {
            if (!container) return;
            
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Initialize with container dimensions
            await app.init({
                backgroundColor: 0xbb00bb,
                width: containerWidth,
                height: containerHeight,
                autoDensity: true,
                resolution: window.devicePixelRatio || 1
            });
            
            app.canvas.style.position = "relative";
            app.canvas.style.width = '100%';
            app.canvas.style.height = '100%';
            app.canvas.style.zIndex = '0';
            app.stage.eventMode = 'passive';

            // Append canvas to container
            container.appendChild(app.canvas);

            const cellWidth = containerWidth / gridSize;
            const cellHeight = containerHeight / gridSize;

            const tiles: Tile[] = [];
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    tiles.push(new Tile(app.stage, x * cellWidth, y * cellHeight, cellWidth, cellHeight));
                }
                
            }
            
            // Mark as ready
            context.ready.set(true);
        }

        init();
        
        return () => {
            // Cleanup on unmount
            app.destroy(true);
            context.ready.set(false);
        };
    });

</script>

<div bind:this={container} class="game-container">
    {#if getPixiContext().ready}
        <slot />
    {/if}
</div>

<style>

    .game-container {
      width: 500px;
      height: 500px;
    }

</style>