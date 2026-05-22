<script lang="ts">
	import { rewards } from "./rewards";
	import { goto } from "$app/navigation";

	const currentLevel = 29;
	const currentXP = 42;
	const maxXP = 100;

	const getIcon = (type: string) => {
		switch (type) {
			case "coins":
				return "💎";
			case "help":
				return "⚡";
			case "avatar":
				return "🧑";
			case "badge":
				return "⭐";
			default:
				return "🎁";
		}
	};

	function handleUpgradeMembership() {
		goto("/pass/payment")
	}

</script>

<div class="battle-pass">
	<!-- HEADER -->
	<div class="top-bar">
		<div class="level-badge">
			<div class="badge-inner">
				{currentLevel}
			</div>
		</div>

		<div class="season-panel">
			<div class="season-header">
				<h1>MARCH</h1>

				<div class="xp-text">
					{currentXP}/{maxXP}
				</div>
			</div>

			<div class="progress-track">
				<div
					class="progress-fill"
					style={`width: ${(currentXP / maxXP) * 100}%`}
				></div>
			</div>
		</div>

		<button class="upgrade-icon"> + </button>
	</div>

	<!-- REWARDS -->
	<div class="reward-wrapper">
		<!-- TRACK SIDEBAR -->
		<div class="track-sidebar">
			<div class="track free">✦</div>

			<div class="track premium">👑</div>
		</div>

		<!-- REWARD GRID -->
		<div class="reward-grid">
			{#each rewards as reward}
				<div class="reward-column">
					<div class="level-header">
						LV.{reward.level}
					</div>

					<!-- FREE -->
					<div class="reward-card free-card">
						<div class="reward-icon">
							{getIcon(reward.free.type)}
						</div>

						<div class="reward-value">
							{reward.free.value}
						</div>
					</div>

					<!-- PREMIUM -->
					<div class="reward-card premium-card">
						<div class="lock">🔒</div>

						<div class="reward-icon">
							{getIcon(reward.premium.type)}
						</div>

						<div class="reward-value">
							{reward.premium.value}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- BUTTON -->
	<div class="upgrade-section">
		<button class="upgrade-button" on:click={handleUpgradeMembership}> Upgrade Membership — ₱299 </button>
	</div>

	<!-- CURRENCY -->
	<div class="currency">
		💎 100
		<span class="old-price">749</span>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #050816;
		font-family: Inter, system-ui, sans-serif;
		color: #e2e8f0;
	}

	.battle-pass {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	/* TOP */

	.top-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.level-badge {
		width: 90px;
		height: 90px;
		flex-shrink: 0;
		border-radius: 24px;
		background: linear-gradient(180deg, #1c2740, #0a1023);
		border: 2px solid rgba(0, 191, 255, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 20px rgba(0, 191, 255, 0.15);
	}

	.badge-inner {
		width: 62px;
		height: 62px;
		border-radius: 999px;
		background: linear-gradient(180deg, #00d2ff, #0077ff);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.8rem;
		font-weight: 800;
		color: white;
	}

	.season-panel {
		flex: 1;
		padding: 1rem 1.5rem;
		border-radius: 18px;
		background: linear-gradient(180deg, #30374d, #23293d);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.season-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	h1 {
		margin: 0;
		font-size: 2.5rem;
		font-weight: 800;
		color: #dbeafe;
		letter-spacing: 0.08em;
	}

	.xp-text {
		font-size: 1.2rem;
		font-weight: 700;
		color: #7dd3fc;
	}

	.progress-track {
		height: 10px;
		margin-top: 1rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, #00d2ff, #0077ff);
		box-shadow: 0 0 12px rgba(0, 191, 255, 0.5);
	}

	.upgrade-icon {
		width: 72px;
		height: 72px;
		border-radius: 18px;
		border: none;
		background: linear-gradient(180deg, #0b1220, #050816);
		border: 1px solid rgba(0, 191, 255, 0.25);
		color: #00d2ff;
		font-size: 2rem;
		font-weight: 700;
		cursor: pointer;
	}

	/* REWARDS */

	.reward-wrapper {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	.track-sidebar {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.track {
		width: 90px;
		height: 120px;
		border-radius: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: 800;
	}

	.track.free {
		background: linear-gradient(180deg, #6573ba, #44507f);
		color: #dbeafe;
	}

	.track.premium {
		background: linear-gradient(180deg, #16a8cc, #0c6b85);
		color: white;
	}

	.reward-grid {
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
		flex: 1;
	}

	.reward-column {
		min-width: 170px;
	}

	.level-header {
		text-align: center;
		padding: 0.65rem;
		background: #111827;
		border-top-left-radius: 12px;
		border-top-right-radius: 12px;
		font-weight: 700;
		color: #cbd5e1;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-bottom: none;
	}

	.reward-card {
		position: relative;
		height: 130px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		border: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(10px);
	}

	.reward-card + .reward-card {
		margin-top: 0.4rem;
		border-radius: 12px;
	}

	.free-card {
		background: #103452;
	}

	.premium-card {
		background: #16a8cc;
		color: #00131d;
		font-weight: 700;
	}

	.reward-icon {
		font-size: 2rem;
		margin-bottom: 0.75rem;
	}

	.reward-value {
		font-size: 0.95rem;
		line-height: 1.25;
		font-weight: 700;
	}

	.lock {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		font-size: 0.8rem;
	}

	/* BOTTOM */

	.upgrade-section {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}

	.upgrade-button {
		padding: 1rem 3rem;
		border: none;
		border-radius: 999px;
		font-size: 1.2rem;
		font-weight: 800;
		cursor: pointer;
		color: #00131d;
		background: linear-gradient(180deg, #00d2ff, #0ea5e9);
		box-shadow: 0 10px 30px rgba(0, 191, 255, 0.25);
	}

	.currency {
		margin-top: 1rem;
		font-size: 1.3rem;
		font-weight: 700;
		color: #7dd3fc;
	}

	.old-price {
		margin-left: 0.5rem;
		color: rgba(255, 255, 255, 0.4);
		text-decoration: line-through;
	}

	/* MOBILE */

	@media (max-width: 768px) {
		.top-bar {
			flex-direction: column;
			align-items: stretch;
		}

		.reward-wrapper {
			flex-direction: column;
		}

		.track-sidebar {
			flex-direction: row;
		}

		.track {
			width: 100%;
			height: 70px;
		}

		h1 {
			font-size: 2rem;
		}
	}
</style>
