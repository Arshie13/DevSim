<script lang="ts">
	export let accentColor: string = '#06b6d4';
	export let accentRgb: string = '6,182,212';
	export let className: string = '';
	export let width: number = 560;
	export let viewBox: string = '0 0 520 370';
	export let contentX: number = 85;
	export let contentY: number = 75;
	export let contentWidth: number = 320;
	export let contentHeight: number = 214;
	export let contentPadding: string = '8px 10px';
	export let float: boolean = false;

	$: vbParts = viewBox.split(' ').map(Number);
	$: vbW = vbParts[2] || 520;
	$: vbH = vbParts[3] || 370;

	$: pad = 16;
	$: rx = 10;
	$: bx = pad;
	$: by = pad;
	$: bw = vbW - pad * 2;
	$: bh = vbH - pad * 2;

	// The inner neon border line is inset 2px from the board with rx-1
	// Its corner straight section starts at (bx+2+rx-1, by+2+rx-1) = (bx+rx+1, by+rx+1)
	// Corner brackets and bolts align to this point so the decor matches the box
	$: cornerOff = rx + 1;  // = 11 — distance from board edge to inner border's corner
	$: armLen = 14;          // length of each bracket arm from the corner inward
</script>

<div
	class={`bubble-cloud-shell ${float ? 'animate-float' : ''} ${className}`}
	style={`--bubble-accent:${accentColor};--bubble-accent-rgb:${accentRgb};`}
>
	<div class="board-glow"></div>

	<svg
		{width}
		{viewBox}
		xmlns="http://www.w3.org/2000/svg"
		style="overflow: visible; display: block;"
	>
		<defs>
			<pattern id="scanlines-{accentColor.replace('#','')}" width="4" height="4" patternUnits="userSpaceOnUse">
				<line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.025)" stroke-width="1" />
			</pattern>
			<filter id="neon-glow-{accentColor.replace('#','')}" x="-20%" y="-20%" width="140%" height="140%">
				<feGaussianBlur stdDeviation="3" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Outer ambient glow ring -->
		<rect x={bx - 2} y={by - 2} width={bw + 4} height={bh + 4} rx={rx + 2}
			fill="none"
			stroke="rgba(var(--bubble-accent-rgb), 0.18)"
			stroke-width="4"
			filter="url(#neon-glow-{accentColor.replace('#','')})"
		/>

		<!-- Board body -->
		<rect x={bx} y={by} width={bw} height={bh} rx={rx}
			fill="#0b0f1a"
			stroke="rgba(255,255,255,0.06)"
			stroke-width="1"
		/>

		<!-- Inner bevel -->
		<rect x={bx + 2} y={by + 2} width={bw - 4} height={bh - 4} rx={rx - 1}
			fill="none"
			stroke="rgba(255,255,255,0.03)"
			stroke-width="1"
		/>

		<!-- Scan lines -->
		<rect x={bx + 1} y={by + 1} width={bw - 2} height={bh - 2} rx={rx - 1}
			fill="url(#scanlines-{accentColor.replace('#','')})"
		/>

		<!-- Neon border line (inset 2px, rx-1 to follow the board's curve) -->
		<rect x={bx + 2} y={by + 2} width={bw - 4} height={bh - 4} rx={rx - 1}
			fill="none"
			stroke={accentColor}
			stroke-width="1.5"
			opacity="0.4`"
			filter="url(#neon-glow-{accentColor.replace('#','')})"
		/>

		<!-- Corner L-brackets — corner aligns with the neon border line's straight section start -->
		<!-- Top-left -->
		<path d="M{bx+cornerOff},{by+cornerOff+armLen}
		         L{bx+cornerOff},{by+cornerOff}
		         L{bx+cornerOff+armLen},{by+cornerOff}"
			fill="none" stroke={accentColor} stroke-width="1.5" opacity="0.85"
			filter="url(#neon-glow-{accentColor.replace('#','')})" />
		<!-- Top-right -->
		<path d="M{bx+bw-cornerOff},{by+cornerOff+armLen}
		         L{bx+bw-cornerOff},{by+cornerOff}
		         L{bx+bw-cornerOff-armLen},{by+cornerOff}"
			fill="none" stroke={accentColor} stroke-width="1.5" opacity="0.85"
			filter="url(#neon-glow-{accentColor.replace('#','')})" />
		<!-- Bottom-right -->
		<path d="M{bx+bw-cornerOff},{by+bh-cornerOff-armLen}
		         L{bx+bw-cornerOff},{by+bh-cornerOff}
		         L{bx+bw-cornerOff-armLen},{by+bh-cornerOff}"
			fill="none" stroke={accentColor} stroke-width="1.5" opacity="0.85"
			filter="url(#neon-glow-{accentColor.replace('#','')})" />
		<!-- Bottom-left -->
		<path d="M{bx+cornerOff},{by+bh-cornerOff-armLen}
		         L{bx+cornerOff},{by+bh-cornerOff}
		         L{bx+cornerOff+armLen},{by+bh-cornerOff}"
			fill="none" stroke={accentColor} stroke-width="1.5" opacity="0.85"
			filter="url(#neon-glow-{accentColor.replace('#','')})" />

		<!-- Corner bolts — centered on the L-bracket corner -->
		<circle cx={bx+cornerOff} cy={by+cornerOff} r="3" fill={accentColor} opacity="0.8" filter="url(#neon-glow-{accentColor.replace('#','')})" />
		<circle cx={bx+bw-cornerOff} cy={by+cornerOff} r="3" fill={accentColor} opacity="0.8" filter="url(#neon-glow-{accentColor.replace('#','')})" />
		<circle cx={bx+bw-cornerOff} cy={by+bh-cornerOff} r="3" fill={accentColor} opacity="0.8" filter="url(#neon-glow-{accentColor.replace('#','')})" />
		<circle cx={bx+cornerOff} cy={by+bh-cornerOff} r="3" fill={accentColor} opacity="0.8" filter="url(#neon-glow-{accentColor.replace('#','')})" />

		<!-- Content area -->
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

	.board-glow {
		position: absolute;
		inset: -20px;
		pointer-events: none;
		border-radius: 14px;
		background: radial-gradient(ellipse at 50% 50%, rgba(var(--bubble-accent-rgb), 0.12) 0%, transparent 70%);
		z-index: 0;
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
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}

	.animate-float {
		animation: float 3s ease-in-out infinite;
	}
</style>
