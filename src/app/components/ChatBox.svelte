<script>
  import { onMount } from 'svelte'

  const AVG_MSG_PX = 58
  const MAX_MSG_PX = Math.round(AVG_MSG_PX * 2.5)

  let messages = $state([])
  let draft = $state('')
  let visible = $state(false)

  const msgAreaHeight = $derived(
    messages.length === 0 ? 0 : Math.min(messages.length * AVG_MSG_PX, MAX_MSG_PX)
  )

  function submit() {
    const text = draft.trim()
    if (!text) return
    messages = [...messages, { text, id: Date.now() }]
    draft = ''
  }

  onMount(() => {
    const zone = document.getElementById('chat-active-zone')
    if (!zone) return
    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(zone)
    return () => observer.disconnect()
  })
</script>

{#if visible}
<div class="chat">

  <!-- Message area: grows then caps, top fades out -->
  <div class="msgs-wrap" style="height: {msgAreaHeight}px;">
    <div class="msgs-inner">
      {#each messages as msg (msg.id)}
        <div class="msg">{msg.text}</div>
      {/each}
    </div>
  </div>

  {#if messages.length > 0}
    <div class="sep"></div>
  {/if}

  <!-- Input row -->
  <div class="input-row">
    <input
      class="input"
      type="text"
      bind:value={draft}
      onkeydown={(e) => e.key === 'Enter' && submit()}
      placeholder="Ask something…"
    />
    <button class="send-btn" onclick={submit} aria-label="Send">↵</button>
  </div>

</div>
{/if}

<style>
  .chat {
    position: fixed;
    bottom: 28px;
    right: 28px;
    width: 300px;
    background: rgba(16, 16, 15, 0.70);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid #222220;
    font-family: 'IBM Plex Mono', monospace;
    z-index: 500;
    overflow: hidden;
  }

  /* Grows upward as messages arrive, capped at ~2.5 message heights */
  .msgs-wrap {
    overflow: hidden;
    transition: height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    /* Fade oldest message out at the top */
    mask-image: linear-gradient(to bottom, transparent 0%, black 35%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 35%);
  }

  /* Flex-end so new messages stack at the bottom;
     overflow clips old ones off the top */
  .msgs-inner {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 100%;
    padding: 10px 16px 10px;
    box-sizing: border-box;
    gap: 10px;
  }

  .msg {
    font-size: 11px;
    line-height: 1.65;
    color: #E2DDD5;
    opacity: 0.75;
    word-break: break-word;
    letter-spacing: 0.02em;
  }

  .sep {
    height: 1px;
    background: #1e1e1c;
  }

  .input-row {
    display: flex;
    align-items: center;
    padding: 0 14px;
    height: 44px;
    gap: 8px;
  }

  .input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: #E2DDD5;
    caret-color: #6B6864;
  }

  .input::placeholder {
    color: #3a3a37;
  }

  .send-btn {
    background: transparent;
    border: none;
    color: #3a3a37;
    font-size: 15px;
    cursor: pointer;
    padding: 4px 2px;
    line-height: 1;
    transition: color 0.2s ease;
    flex-shrink: 0;
  }

  .send-btn:hover {
    color: #6B6864;
  }
</style>
