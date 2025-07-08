/* File: chat-widget.js */
(function(){
  // 1. n8n Chat Widget Config
  window.ChatWidgetConfig = {
    webhook: {
      url: 'https://proxy.cors.sh/https://damiannstudio.app.n8n.cloud/webhook/f4b34c09-655e-4fee-8593-825a3000fcec/chat',
      route: 'general'
    }
  };

  // 2. 產生或讀取 chatId
  function getChatId() {
    let cid = sessionStorage.getItem('chatId');
    if (!cid) {
      cid = 'chat_' + Math.random().toString(36).slice(2, 11);
      sessionStorage.setItem('chatId', cid);
    }
    return cid;
  }

  // 3. 開／關 Chat 視窗
  const chatBtn = document.getElementById('chat-widget-button');
  const chatContainer = document.getElementById('chat-widget-container');
  chatBtn.addEventListener('click', () => {
    chatContainer.style.display = 'flex';
    chatBtn.style.display = 'none';
    document.getElementById('chat-widget-input').focus();
  });
  window.closeChatWidget = function() {
    chatContainer.style.display = 'none';
    chatBtn.style.display = 'flex';
  };

  // 4. 傳訊並顯示回覆
  async function sendMessage() {
    const inputEl = document.getElementById('chat-widget-input');
    const msg = inputEl.value.trim();
    if (!msg) return;
    const bodyEl = document.getElementById('chat-widget-body');

    // 使用者訊息
    const um = document.createElement('div');
    um.className = 'user-message chat-message';
    um.innerHTML = `<span>${msg}</span>`;
    bodyEl.appendChild(um);

    // Loading 狀態
    const lm = document.createElement('div');
    lm.id = '__loading';
    lm.className = 'bot-message chat-message';
    lm.innerHTML = `<div>Thinking...</div>`;
    bodyEl.appendChild(lm);
    bodyEl.scrollTop = bodyEl.scrollHeight;

    try {
      const res = await fetch(window.ChatWidgetConfig.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cors-api-key': 'live_6ed1988eef69805095b983da8425845588a78d58a8183e8bf26e028268bd4d47'
        },
        body: JSON.stringify({
          chatId: getChatId(),
          sessionId: getChatId(),
          message: msg,
          route: window.ChatWidgetConfig.webhook.route
        })
      });
      const data = await res.json();
      // 移除 Loading
      document.getElementById('__loading')?.remove();

      // 取內容並渲染 Markdown
      const reply = data.output || data.response || data.text || '抱歉，出錯了。';
      const bm = document.createElement('div');
      bm.className = 'bot-message chat-message';
      bm.innerHTML = `<div>${marked.parse(reply)}</div>`;
      bodyEl.appendChild(bm);
      bodyEl.scrollTop = bodyEl.scrollHeight;

    } catch (e) {
      // 失敗也要移除 Loading
      document.getElementById('__loading')?.remove();
      const err = document.createElement('div');
      err.className = 'bot-message chat-message';
      err.innerHTML = `<div>連線失敗，請稍後再試。</div>`;
      bodyEl.appendChild(err);
    }

    inputEl.value = '';
  }

  // 5. 綁定送出按鈕 & Enter
  document.getElementById('chat-widget-send')
          .addEventListener('click', sendMessage);
  document.getElementById('chat-widget-input')
          .addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

})();
