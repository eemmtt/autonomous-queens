<script lang="ts">
    import { Application } from "pixi.js";
    import { getPixiContext, setPixiContext } from "../pixi";
    import { onMount } from "svelte";
	import { Board } from "./Board";
	import { GameState, getGameState, getGridSize, getRegions } from "$lib/model";

    // Local state
    let container: HTMLDivElement;
    let app: Application;
    
    // Setup context
    const context = setPixiContext(new Application());
    app = context.app;

    onMount(() => {

        async function init() {
            if (!container) return;
            const start = performance.now();
            
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Initialize with container dimensions
            await app.init({
                backgroundAlpha: 0,
                //backgroundColor: 0xbb00bb,
                width: containerWidth,
                height: containerHeight,
                autoDensity: true,
                resolution: window.devicePixelRatio || 1
            });
            
            //set generated canvas styling
            app.canvas.style.position = "relative";
            app.canvas.style.width = '100%';
            app.canvas.style.height = '100%';
            app.canvas.style.zIndex = '0';
            app.stage.eventMode = 'passive';

            // Append canvas to container
            container.appendChild(app.canvas);

            const board = new Board(app.stage, containerWidth, containerHeight, $getRegions, $getGridSize);

            
            // Mark as ready
            context.ready.set(true);
            console.log("pixiInit in", performance.now() - start, "ms");

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
    {:else}
        <p>Loading!</p>
    {/if}
    
    {#if $getGameState == GameState.win}
        Woohoo
    {/if}
</div>

<style>

    .game-container {
      width: 500px;
      height: 500px;
    
      /*
      border-style: solid;
      border-width: 0.1em;
      border-color: rgb(28, 0, 51);
      */
    }

</style>