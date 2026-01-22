<script lang="ts">
  import { signIn, signOut } from "@auth/sveltekit/client";
  import { page } from "$app/state";
</script>

<div>
  {#if page.data.session}
    <p>Logged in as {page.data.session.user?.name}</p>
    <button on:click={() => signOut()}>Sign Out</button>
  {:else}
    <button on:click={() => signIn("google")}>Sign In</button>
  {/if}
</div>
