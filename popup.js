document.addEventListener('DOMContentLoaded', function() {
  const youtubeUrlInput = document.getElementById('youtubeUrl');
  const positionSelect = document.getElementById('position');
  const sizeSlider = document.getElementById('size');
  const sizeValue = document.getElementById('sizeValue');
  const opacitySlider = document.getElementById('opacity');
  const opacityValue = document.getElementById('opacityValue');
  const embedBtn = document.getElementById('embedBtn');
  const removeBtn = document.getElementById('removeBtn');
  const status = document.getElementById('status');

  // 載入已儲存的設定
  loadSettings();

  // 尺寸滑桿事件
  sizeSlider.addEventListener('input', function() {
    sizeValue.textContent = this.value + 'px';
  });

  // 透明度滑桿事件
  opacitySlider.addEventListener('input', function() {
    const percentage = Math.round(this.value * 100);
    opacityValue.textContent = percentage + '%';
  });

  // 嵌入影片按鈕
  embedBtn.addEventListener('click', function() {
    const url = youtubeUrlInput.value.trim();
    if (!url) {
      showStatus('請輸入YouTube網址', 'error');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      showStatus('請輸入有效的YouTube網址', 'error');
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      showStatus('無法解析YouTube影片ID', 'error');
      return;
    }

    const settings = {
      videoId: videoId,
      position: positionSelect.value,
      size: parseInt(sizeSlider.value),
      opacity: parseFloat(opacitySlider.value)
    };

    // 儲存設定
    saveSettings(settings);

    // 發送訊息到content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0]) {
        showStatus('無法取得當前頁面', 'error');
        return;
      }
      
      // 先嘗試注入content script
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      }, function() {
        if (chrome.runtime.lastError) {
          console.error('Script injection error:', chrome.runtime.lastError);
          showStatus('無法注入腳本，請檢查頁面權限', 'error');
          return;
        }
        
        // 等待一下讓腳本載入
        setTimeout(() => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'embedVideo',
            settings: settings
          }, function(response) {
            if (chrome.runtime.lastError) {
              console.error('Chrome runtime error:', chrome.runtime.lastError);
              showStatus('無法在當前頁面嵌入影片，請重新載入頁面後再試', 'error');
            } else if (response && response.success) {
              showStatus('影片已成功嵌入！', 'success');
            } else {
              console.error('Response error:', response);
              showStatus('嵌入影片時發生錯誤: ' + (response?.error || '未知錯誤'), 'error');
            }
          });
        }, 100);
      });
    });
  });

  // 移除影片按鈕
  removeBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0]) {
        showStatus('無法取得當前頁面', 'error');
        return;
      }
      
      // 先嘗試注入content script
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      }, function() {
        if (chrome.runtime.lastError) {
          console.error('Script injection error:', chrome.runtime.lastError);
          showStatus('無法注入腳本，請檢查頁面權限', 'error');
          return;
        }
        
        // 等待一下讓腳本載入
        setTimeout(() => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'removeVideo'
          }, function(response) {
            if (chrome.runtime.lastError) {
              console.error('Chrome runtime error:', chrome.runtime.lastError);
              showStatus('無法移除影片，請重新載入頁面後再試', 'error');
            } else if (response && response.success) {
              showStatus('影片已移除', 'success');
            } else {
              console.error('Response error:', response);
              showStatus('移除影片時發生錯誤: ' + (response?.error || '未知錯誤'), 'error');
            }
          });
        }, 100);
      });
    });
  });

  // 驗證YouTube網址
  function isValidYouTubeUrl(url) {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w\-_]+/,
      /^https?:\/\/youtu\.be\/[\w\-_]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w\-_]+/,
      /^https?:\/\/(www\.)?youtube\.com\/watch\?.*v=[\w\-_]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  // 提取影片ID
  function extractVideoId(url) {
    console.log('Extracting video ID from:', url);
    
    const patterns = [
      /[?&]v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /embed\/([^?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const videoId = match[1];
        console.log('Found video ID:', videoId);
        return videoId;
      }
    }
    
    console.log('No video ID found');
    return null;
  }

  // 顯示狀態訊息
  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }

  // 儲存設定
  function saveSettings(settings) {
    chrome.storage.local.set({
      youtubeSettings: settings
    });
  }

  // 載入設定
  function loadSettings() {
    chrome.storage.local.get(['youtubeSettings'], function(result) {
      if (result.youtubeSettings) {
        const settings = result.youtubeSettings;
        youtubeUrlInput.value = `https://www.youtube.com/watch?v=${settings.videoId}`;
        positionSelect.value = settings.position || 'bottom-left';
        sizeSlider.value = settings.size || 300;
        sizeValue.textContent = (settings.size || 300) + 'px';
        opacitySlider.value = settings.opacity || 0.9;
        const opacityPercentage = Math.round((settings.opacity || 0.9) * 100);
        opacityValue.textContent = opacityPercentage + '%';
      }
    });
  }
});
