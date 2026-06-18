<script lang="ts">
  import type { PageData } from './$types';
  import type { UserData } from '$types';
  import Header from '$components/Header.svelte';
  import ScenarioList from '$components/scenario/ScenarioList.svelte';

  export let data: PageData;

  const headerUserData: Partial<UserData> = {
    name: data.user?.name ?? 'No Name',
    email: data.user.email ?? 'No email',
    image: data.user.image ?? 'No image found',
    id: data.user.id ?? '',
    avatar: data.user?.image ?? '../static/avatars/defaultcyan.svg',
    fullName: data.user?.name ?? data.user?.name ?? 'No name found',
    coins: data.userCoins,
  };
</script>

<svelte:head>
  <title>DevSim — Choose Your Scenario</title>
</svelte:head>

<div class="page-root">
  <!-- Background layers -->
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="bg-orb" aria-hidden="true"></div>
  <div class="bg-scanlines" aria-hidden="true"></div>

  <div class="relative z-10 flex flex-col min-h-screen">
    <Header userData={headerUserData} />

      <main class="w-full max-w-[1200px] mx-auto px-4 py-4 md:px-6 lg:px-8">
      <ScenarioList
        scenarios={data.scenarios}
        stackName={data.stackName}
        selection={data.selection}
        tutorialState={data.tutorialState}
      />
    </main>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #0a0e1a;
  }

  .page-root {
    min-height: 100vh;
    background: #0a0e1a;
    color: #d0d7dd;
    position: relative;
  }

  .bg-grid {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-image:
      repeating-linear-gradient(0deg,   rgba(7,165,201,0.06) 0, rgba(7,165,201,0.06) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(90deg,  rgba(7,165,201,0.06) 0, rgba(7,165,201,0.06) 1px, transparent 1px, transparent 40px);
    pointer-events: none;
  }

  .bg-orb {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60vh;
    z-index: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(7,165,201,0.08), transparent);
    pointer-events: none;
  }

  .bg-scanlines {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(0,0,0,0.015) 4px
    );
    pointer-events: none;
  }
</style>
