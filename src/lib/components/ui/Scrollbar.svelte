<script lang="ts">
  /**
   * Scrollbar - A reusable scrollbar wrapper component
   * 
   * Usage:
   * <Scrollbar>
   *   <div class="max-h-[400px]">
   *     Your scrollable content here
   *   </div>
   * </Scrollbar>
   * 
   * Or with horizontal scrolling:
   * <Scrollbar horizontal>
   *   <div>
   *     Your horizontal content
   *   </div>
   * </Scrollbar>
   */
  
  export let horizontal: boolean = false;
  export let className: string = '';
</script>

<div class="ds-scrollbar {horizontal ? 'ds-scrollbar-horizontal' : ''} {horizontal ? 'overflow-x-auto' : 'overflow-y-auto'} {className}">
  <slot />
</div>

<style>
  /* Modern sleek scrollbar - dark theme with subtle shadow */
  .ds-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(136, 146, 160, 0.3) rgba(10, 14, 26, 0.6);
  }

  .ds-scrollbar-horizontal {
    scrollbar-width: thin;
    scrollbar-color: rgba(136, 146, 160, 0.3) rgba(10, 14, 26, 0.6);
  }

  /* Webkit Scrollbar - Vertical (default) */
  .ds-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .ds-scrollbar::-webkit-scrollbar-track {
    background: rgba(10, 14, 26, 0.6);
    border-radius: 4px;
    margin: 4px 0;
  }

  .ds-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(136, 146, 160, 0.3);
    border-radius: 4px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 1px 3px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  .ds-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(7, 165, 201, 0.6);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 10px rgba(7, 165, 201, 0.4);
  }

  .ds-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(136, 146, 160, 0.45);
  }

  /* Webkit Scrollbar - Horizontal */
  .ds-scrollbar-horizontal::-webkit-scrollbar {
    height: 6px;
  }

  .ds-scrollbar-horizontal::-webkit-scrollbar-track {
    background: rgba(10, 14, 26, 0.6);
    border-radius: 4px;
    margin: 0 4px;
  }

  .ds-scrollbar-horizontal::-webkit-scrollbar-thumb {
    background: rgba(136, 146, 160, 0.3);
    border-radius: 4px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 1px 3px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  .ds-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
    background: rgba(7, 165, 201, 0.6);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 10px rgba(7, 165, 201, 0.4);
  }

  .ds-scrollbar-horizontal:hover::-webkit-scrollbar-thumb {
    background: rgba(136, 146, 160, 0.45);
  }
</style>
