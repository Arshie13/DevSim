<script lang='ts'>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
  import {
    loadStripe,
    type Stripe,
    type StripeElements,
    type StripeCardElement,
  } from '@stripe/stripe-js';
  import type { PageData } from './$types';
  import { Coins, ShieldCheck, Zap, Lock, CreditCard, ArrowLeft, Loader2 } from 'lucide-svelte';

  export let data: PageData;

  let stripe: Stripe | null = null;
  let elements: StripeElements | null = null;
  let cardElement: StripeCardElement | null = null;
  let isSubmitting = false;
  let isStripeLoading = false;
  let errorMessage = '';
  let stripeInitialized = false;

  const product = data.product;

  onMount(async () => {
    console.log('Checkout: Initializing Stripe with key:', PUBLIC_STRIPE_PUBLISHABLE_KEY);
    isStripeLoading = true;
    if (!PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      errorMessage = 'Stripe publishable key is missing. Check your .env file.';
      isStripeLoading = false;
      return;
    }

    try {
      const stripeInstance = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
      stripe = stripeInstance;

      if (!stripe) {
        errorMessage = 'Failed to initialize Stripe';
        return;
      }

      elements = stripe.elements();

      cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#e2e8f0',
            fontFamily: 'Orbitron, "JetBrains Mono", monospace', 
            fontSmoothing: 'antialiased',
            '::placeholder': {
              color: '#94a3b8',
            },
          },
          invalid: {
            color: '#fb7185',
            iconColor: '#fb7185',
          },
        },
        hidePostalCode: true,
      });

      setTimeout(() => {
        const mountPoint = document.getElementById('card-element');
        if (mountPoint) {
          cardElement!.mount('#card-element');
          stripeInitialized = true;
          console.log('Checkout: Stripe Element mounted successfully.');

          cardElement!.on('change', (event) => {
            if (event.error) {
              errorMessage = event.error.message;
            } else {
              errorMessage = '';
            }
          });
        } else {
          errorMessage = 'Payment form failed to load (mount point missing)';
        }
      }, 100);
    } catch (err) {
      console.error('Stripe initialization error:', err);
      errorMessage = 'Failed to initialize payment system';
    } finally {
      isStripeLoading = false;
    }
  });

  async function handleSubmit() {
    console.log('Checkout: handleSubmit triggered');
    
    if (!stripe || !cardElement) {
      errorMessage = 'Payment system not ready. Please wait.';
      console.warn('Checkout: Stripe or CardElement not ready', { stripe, cardElement });
      return;
    }

    isSubmitting = true;
    errorMessage = '';

    try {
      console.log('Checkout: Step 1 - Creating Payment Intent for:', product.id);
      const response = await fetch('/api/marketplace/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageId: product.id === 'custom' ? null : product.id, 
          customAmount: product.id === 'custom' ? product.amount : null 
        }),
      });

      const intentData = await response.json();
      console.log('Checkout: Step 1 Response:', intentData);
      
      if (intentData.error) throw new Error(intentData.error);
      if (!intentData.clientSecret) throw new Error('Server failed to provide authorization secret');

      const { clientSecret } = intentData;

      console.log('Checkout: Step 2 - Confirming Card Payment...');
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (confirmError) {
        console.error('Checkout: Stripe Confirmation Error:', confirmError);
        throw new Error(confirmError.message);
      }

      console.log('Checkout: Step 2 Success - PaymentIntent status:', paymentIntent?.status);
      cardElement.clear();

      console.log('Checkout: Step 3 - Finalizing Core Injection on server...');
      const finalizeResponse = await fetch('/api/marketplace/coins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });

      const finalizeData = await finalizeResponse.json();
      console.log('Checkout: Step 3 Response:', finalizeData);

      if (!finalizeResponse.ok || finalizeData.error) {
        throw new Error(finalizeData.error || 'Failed to finalize coin injection. Please contact support.');
      }

      console.log('Checkout: Purchase Complete! Redirecting...');
      alert(`Success! ${product.amount.toLocaleString()} coins have been added to your account.`);
      goto('/dashboard');
    } catch (err: any) {
      console.error('Checkout: Payment loop error:', err);
      errorMessage = err.message || 'An unexpected error occurred during processing.';
    } finally {
      isSubmitting = false;
    }
  }

  function goBack() {
    goto('/marketplace/coins');
  }
</script>

<svelte:head>
  <title>Checkout | Coins Marketplace</title>
</svelte:head>

<div class='min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber py-12 px-6'>
  <div class='max-w-[1000px] mx-auto'>
    <button 
      on:click={goBack}
      class='flex items-center gap-2 text-obsidian-text-primary/60 hover:text-cyber-cyan transition-colors mb-8 font-orbitron text-sm uppercase tracking-widest'
    >
      <ArrowLeft class='w-4 h-4' />
      Back to Marketplace
    </button>

    <div class='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      <div class='bg-obsidian-bg-light/40 border border-obsidian-accent/10 rounded-card p-8 backdrop-blur-md'>
        <div class='flex items-center gap-3 mb-6'>
          <div class='p-2 rounded-lg bg-cyber-warn/10 border border-cyber-warn/20'>
            <Coins class='w-6 h-6 text-cyber-warn' />
          </div>
          <h2 class='text-xl font-orbitron font-bold text-obsidian-text-muted uppercase tracking-tighter'>Order Summary</h2>
        </div>

        <div class='space-y-6'>
          <div class='flex justify-between items-start border-b border-obsidian-accent/10 pb-6'>
            <div>
              <p class='text-lg font-orbitron font-bold text-obsidian-text-muted'>{product.name}</p>
              <p class='text-sm font-rajdhani text-obsidian-text-primary/50'>Simulation Currency Injection</p>
            </div>
            <div class='text-right'>
              <p class='text-lg font-orbitron font-bold text-cyber-warn'>{product.amount.toLocaleString()} Coins</p>
            </div>
          </div>

          <div class='space-y-3'>
            <div class='flex justify-between text-sm font-rajdhani'>
              <span class='text-obsidian-text-primary/60 uppercase tracking-widest'>Subtotal</span>
              <span class='text-obsidian-text-muted font-bold'>{product.price}</span>
            </div>
            <div class='flex justify-between text-sm font-rajdhani'>
              <span class='text-obsidian-text-primary/60 uppercase tracking-widest'>Service Fee</span>
              <span class='text-obsidian-text-muted font-bold'>₱0.00</span>
            </div>
            <div class='flex justify-between text-xl font-orbitron font-bold pt-4 border-t border-obsidian-accent/20'>
              <span class='text-obsidian-text-muted uppercase tracking-tighter'>Total</span>
              <span class='text-cyber-cyan shadow-cyan-glow'>{product.price}</span>
            </div>
          </div>

          <div class='grid grid-cols-1 gap-4 mt-8'>
            <div class='flex items-start gap-3 p-4 rounded-lg bg-obsidian-bg/40 border border-obsidian-accent/5'>
              <Zap class='w-5 h-5 text-cyber-cyan shrink-0' />
              <div>
                <p class='text-xs font-orbitron font-bold text-obsidian-text-muted uppercase tracking-wider mb-1'>Instant Core Injection</p>
                <p class='text-[0.7rem] font-rajdhani text-obsidian-text-primary/50'>Coins are credited to your developer profile immediately upon verification.</p>
              </div>
            </div>
            <div class='flex items-start gap-3 p-4 rounded-lg bg-obsidian-bg/40 border border-obsidian-accent/5'>
              <ShieldCheck class='w-5 h-5 text-emerald-500 shrink-0' />
              <div>
                <p class='text-xs font-orbitron font-bold text-obsidian-text-muted uppercase tracking-wider mb-1'>Encrypted Protocol</p>
                <p class='text-[0.7rem] font-rajdhani text-obsidian-text-primary/50'>Secure end-to-end encryption using military-grade cyber-mesh standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class='bg-obsidian-bg-light/40 border border-obsidian-accent/10 rounded-card p-8 backdrop-blur-md flex flex-col'>
        <div class='flex items-center justify-between mb-8 pb-4 border-b border-obsidian-accent/10'>
          <div class='flex items-center gap-3'>
            <CreditCard class='w-5 h-5 text-obsidian-accent' />
            <h2 class='text-lg font-orbitron font-bold text-obsidian-text-muted uppercase tracking-widest'>Secure Payment</h2>
          </div>
          <div class='flex items-center gap-1 opacity-40'>
            <Lock class='w-3 h-3 text-obsidian-text-primary' />
            <span class='text-[0.6rem] font-mono uppercase tracking-widest'>SSL</span>
          </div>
        </div>

        {#if errorMessage}
          <div class='mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono' role='alert'>
            {errorMessage}
          </div>
        {/if}

        {#if isStripeLoading}
          <div class='flex flex-col items-center justify-center flex-1 py-12'>
            <Loader2 class='w-8 h-8 text-cyber-cyan animate-spin mb-4' />
            <p class='text-sm font-orbitron text-obsidian-text-primary/50 animate-pulse uppercase tracking-widest'>Initializing secure gateway...</p>
          </div>
        {:else}
          <form on:submit|preventDefault={handleSubmit} class='flex flex-col flex-1'>
            <div class='mb-8'>
              <label class='block text-[0.65rem] font-orbitron font-bold text-obsidian-text-primary/40 uppercase tracking-[0.2em] mb-3' for='card-element'>
                Neural-Link Card Authorization
              </label>
              <div class='p-4 rounded-lg bg-obsidian-bg/60 border border-obsidian-accent/20 focus-within:border-cyber-cyan/40 transition-colors'>
                <div id='card-element'>
                  {#if !stripeInitialized}
                    <div class='text-xs font-mono text-obsidian-text-primary/30 animate-pulse'>Loading authorization matrix...</div>
                  {/if}
                </div>
              </div>
            </div>

            <button 
              type='submit' 
              disabled={isSubmitting || !stripeInitialized}
              class='btn-cyber btn-cyber-solid w-full !py-5 flex items-center justify-center gap-3 group relative overflow-hidden transition-all duration-300 disabled:opacity-30 disabled:grayscale'
            >
              {#if isSubmitting}
                <Loader2 class='w-5 h-5 animate-spin' />
                <span class='font-orbitron font-bold uppercase tracking-widest'>Authorizing...</span>
              {:else}
                <ShieldCheck class='w-5 h-5 group-hover:scale-110 transition-transform' />
                <span class='font-orbitron font-bold uppercase tracking-widest'>Authorize Payment</span>
              {/if}
            </button>

            <div class='mt-auto pt-8 flex items-center justify-center gap-4 opacity-30 grayscale'>
              <img src='https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' alt='Visa' class='h-3' />
              <img src='https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' alt='Mastercard' class='h-5' />
              <img src='https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' alt='Stripe' class='h-4' />
            </div>
            
            <p class='mt-6 text-center text-[0.6rem] font-mono text-obsidian-text-primary/30 uppercase tracking-widest'>
              Authorization tokens are processed securely. No raw card data touches our matrix.
            </p>
          </form>
        {/if}
      </div>
    </div>
  </div>

  <div class='fixed inset-0 pointer-events-none overflow-hidden -z-10'>
    <div class='absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-[150px]' style='background: rgba(7,165,201,0.08);'></div>
    <div class='absolute bottom-1/4 -left-32 w-96 h-96 rounded-full blur-[150px]' style='background: rgba(255,180,0,0.03);'></div>
  </div>
</div>

<style>
  :global(.StripeElement) {
    width: 100%;
  }
</style>