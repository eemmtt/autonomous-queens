<script lang="ts">
    import { Application, Assets, Point, Sprite, Texture } from "pixi.js";
    import { getPixiContext, setPixiContext } from "../pixi";
    import { onMount } from "svelte";
	import { gridSize, regions, solution } from "$lib/solution";
	import { Tile, type TileTextures } from "./Tile";
	import { assets } from "$app/paths";
	import { Board } from "./Board";

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


            /*
            const flagUpTex = await Assets.load('/flag3_up.png');
            const flagDwTex = await Assets.load('/flag3_down.png');
            const flagBgTex = await Assets.load('/flag3_bg.png');
            const exTex =  await Assets.load('/ex2.png');

            const tileTextures: TileTextures = {
                flag: {
                    up: flagUpTex,
                    down: flagDwTex,
                    bg: flagBgTex
                },
                ex: exTex
            }

            const tiles: Tile[] = [];
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    const isSolve = solution.solution[x][y] == 1? true: false;
                    tiles.push(new Tile(app.stage, x * cellWidth, y * cellHeight, cellWidth, cellHeight, tileTextures, regions[x][y], isSolve));
                }
                
            }
            */

            const board = new Board(app.stage, containerWidth, containerHeight);
            
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
    
      /*
      border-style: solid;
      border-width: 0.1em;
      border-color: rgb(28, 0, 51);
      */
    }

</style>