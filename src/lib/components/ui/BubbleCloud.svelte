<script lang="ts">
	export let accentColor: string = '#06b6d4';
	export let accentRgb: string = '6,182,212';
	export let className: string = '';
	export let width: number = 560;
	export let viewBox: string = '0 0 520 350';
	export let contentX: number = 85;
	export let contentY: number = 75;
	export let contentWidth: number = 320;
	export let contentHeight: number = 200;
	export let contentPadding: string = '8px 10px';
	export let float: boolean = false;
	export let showTrail: boolean = true;
</script>

<div
	class={`bubble-cloud-shell ${float ? 'animate-float' : ''} ${className}`}
	style={`--bubble-accent:${accentColor};--bubble-accent-rgb:${accentRgb};`}
>
	<svg
		{width}
		{viewBox}
		xmlns="http://www.w3.org/2000/svg"
		style="overflow: visible; display: block;"
	>
		<path d="
			M130,312 Q74,314 54,278 Q34,242 54,218
			Q30,198 36,168 Q44,138 78,128
			Q66,102 86,82 Q110,60 140,70
			Q146,46 176,38 Q210,28 234,48
			Q256,30 286,36 Q320,42 332,68
			Q352,50 380,62 Q410,76 406,106
			Q430,116 440,146 Q452,180 432,204
			Q452,222 444,252 Q434,276 402,276
			Q392,296 364,296 Q350,282 336,292
			Q310,306 282,296 Q258,308 234,294
			Q206,308 180,296 Q154,306 134,290
			Q112,302 130,312Z
		"
			fill="none"
			stroke-width="10"
			style="stroke: rgba(var(--bubble-accent-rgb), 0.18);"
		/>
		<path d="
			M130,312 Q74,314 54,278 Q34,242 54,218
			Q30,198 36,168 Q44,138 78,128
			Q66,102 86,82 Q110,60 140,70
			Q146,46 176,38 Q210,28 234,48
			Q256,30 286,36 Q320,42 332,68
			Q352,50 380,62 Q410,76 406,106
			Q430,116 440,146 Q452,180 432,204
			Q452,222 444,252 Q434,276 402,276
			Q392,296 364,296 Q350,282 336,292
			Q310,306 282,296 Q258,308 234,294
			Q206,308 180,296 Q154,306 134,290
			Q112,302 130,312Z
		"
			fill="#0f172a"
			stroke-width="2"
			style="stroke: rgba(var(--bubble-accent-rgb), 0.65);"
		/>

		{#if showTrail}
			<circle cx="444" cy="316" r="12" fill="#0f172a" stroke-width="2" style="stroke: rgba(var(--bubble-accent-rgb), 0.55);"/>
			<circle cx="468" cy="340" r="8" fill="#0f172a" stroke-width="1.5" style="stroke: rgba(var(--bubble-accent-rgb), 0.4);"/>
			<circle cx="488" cy="360" r="5" fill="#0f172a" stroke-width="1.5" style="stroke: rgba(var(--bubble-accent-rgb), 0.28);"/>
		{/if}

		<foreignObject x={contentX} y={contentY} width={contentWidth} height={contentHeight}>
			<div xmlns="http://www.w3.org/1999/xhtml" class="bubble-content" style={`padding: ${contentPadding};`}>
				<slot />
			</div>
		</foreignObject>
	</svg>
</div>

<style>
	.bubble-cloud-shell {
		position: relative;
		display: inline-block;
	}

	.bubble-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		overflow: hidden;
		font-family: sans-serif;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.animate-float {
		animation: float 3s ease-in-out infinite;
	}
</style>
