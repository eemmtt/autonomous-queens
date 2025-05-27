<script lang="ts">
    import { Application } from "pixi.js";
    import { getPixiContext, setPixiContext } from "../pixi";
    import { onMount } from "svelte";
	import { Board } from "./Board";
	import { game, GameState, getGameAnnotations, getGameEndTime, getGameId, getGameNotifications, getGameStartTime, getGameState, getGridSize, getRegions } from "$lib/model";
	import { derived } from "svelte/store";

    // Local state
    let container: HTMLDivElement;
    let app: Application;
    let elapsed = 0;
    let interval: NodeJS.Timeout;
    
    // Setup context
    const context = setPixiContext(new Application());
    app = context.app;
    let board: Board;

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
            //app.canvas.style.position = "relative";
            app.canvas.style.width = '100%';
            app.canvas.style.height = '100%';
            app.canvas.style.zIndex = '0';
            app.stage.eventMode = 'passive';

            // Append canvas to container
            container.appendChild(app.canvas);

            board = new Board(app.stage, containerWidth, containerHeight, $getRegions, $getGridSize);

            const unsubId = getGameId.subscribe((id) => {
                app.stage.removeChildren();
                board = new Board(app.stage, containerWidth, containerHeight, $getRegions, $getGridSize );
            });

            const unsubAnnotation = getGameAnnotations.subscribe((annotations) => {
                board.updateAnnotations(annotations);
            });



            
            // Mark as ready
            context.ready.set(true);
            //console.log("pixiInit in", performance.now() - start, "ms");

        }

        init();

        interval = setInterval(() => {
            elapsed = Math.floor((Date.now() - $getGameStartTime) / 1000);
        }, 200);
        
        return () => {
            // Cleanup on unmount
            app.destroy(true);
            context.ready.set(false);
            if (interval) clearInterval(interval);
        };
    });


</script>



<div bind:this={container} class="game-container">
    
    {#if getPixiContext().ready}
        <slot />
    {/if}
</div>

<div class="menu">
    <div class="status">
        {#if $getGameState == GameState.win}
           good looks achieved in {$getGameEndTime}s
        {:else if !getPixiContext().ready}
           loading...
        {:else}
           {elapsed} s
        {/if}
    </div>
    
    <button class="reset-button" on:click={() => game.reset(8)}>&circlearrowleft;</button>
</div>


<style>

    .game-container {
        width: 500px;
        height: 500px;
    }

    .menu {
        width: 400px;
        height: 2.5em;
        display: grid;
        grid-template-columns: repeat(1fr, 5);
        grid-template-rows: 2.5em;
        column-gap: 1em;
    }

    .reset-button {
       grid-column: 4 / 5;
       grid-row: 2.5em;
       padding: 0.5em 1em;
       border: none;
       background-color: #e6dfc2;
       font-size: large;
    }

    .status {
       grid-column: 1 / 4;
       grid-row: 2.5em;
       border: none;
       background-color: #e6dfc2;
       padding: 0.5em 1em;
    }

</style>