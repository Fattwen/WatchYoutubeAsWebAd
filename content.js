// YouTube 嵌入小廣告 Content Script

let videoContainer = null;
let currentSettings = null;
let bgInterval = null;

// 監聽來自popup的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  try {
    if (request.action === 'embedVideo') {
      const result = embedVideo(request.settings);
      sendResponse({success: result});
    } else if (request.action === 'removeVideo') {
      removeVideo();
      sendResponse({success: true});
    } else {
      sendResponse({success: false, error: 'Unknown action'});
    }
  } catch (error) {
    console.error('Content script error:', error);
    sendResponse({success: false, error: error.message});
  }
  
  return true; // 保持訊息通道開放
});

// 嵌入影片
function embedVideo(settings) {
  console.log('Embedding video with settings:', settings);
  
  try {
    // 檢查設定是否有效
    if (!settings || !settings.videoId) {
      console.error('Invalid settings:', settings);
      return false;
    }
    
    // 先移除現有的影片
    removeVideo();
    
    currentSettings = settings;
    
    // 確保document.body存在
    if (!document.body) {
      console.error('Document body not ready');
      return false;
    }
    
    // 固定品牌色（藍-紫）
    const brandColors = ['#667eea', '#764ba2'];
    
    // 創建影片容器
    videoContainer = document.createElement('div');
    videoContainer.id = 'youtube-ad-container';
    videoContainer.className = `youtube-ad ${settings.position}`;
    
    // 設定容器尺寸
    const size = settings.size || 300;
    videoContainer.style.width = `${size}px`;
    videoContainer.style.height = `${size * 1.35}px`; // 2:3 比例
    
    // 創建標題區域
    const header = document.createElement('div');
    header.className = 'youtube-ad-header';
    header.innerHTML = '🔥🔥2025最火網遊🔥🔥';
    header.style.background = `linear-gradient(135deg, ${brandColors[0]}, ${brandColors[1]})`;
    
    // 創建影片區域
    const videoArea = document.createElement('div');
    videoArea.className = 'youtube-ad-video';
    
    // 創建關閉按鈕
    const closeBtn = document.createElement('div');
    closeBtn.className = 'youtube-ad-close';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', removeVideo);
    
    
    // 創建YouTube iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${settings.videoId}?autoplay=0&controls=1&showinfo=0&rel=0`;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    
    // 創建底部按鈕區域
    const footer = document.createElement('div');
    footer.className = 'youtube-ad-footer';
    footer.style.background = `linear-gradient(135deg, ${brandColors[1]}, ${brandColors[0]})`;
    
    // 設定Faker圖片作為背景
    const fakerImageUrl = chrome.runtime.getURL('Faker.png');
    const bgImageUrl = chrome.runtime.getURL('BG.png');
    
    footer.style.backgroundImage = `url(${fakerImageUrl})`;
    footer.style.backgroundSize = 'cover';
    footer.style.backgroundPosition = 'center';
    footer.style.backgroundRepeat = 'no-repeat';
    
    // 添加半透明覆蓋層以確保文字可讀性
    footer.style.position = 'relative';
    footer.style.overflow = 'hidden';
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, ${brandColors[1]}80, ${brandColors[0]}80);
      z-index: 1;
      opacity: 1;
    `;
    
    // 創建BG覆蓋層
    const bgOverlay = document.createElement('div');
    bgOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url(${bgImageUrl});
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      z-index: 0;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    
    // 每10秒顯示BG覆蓋層3秒
    const showBgOverlay = () => {
      // 顯示BG.png，完全不透明，並暫時關閉藍紫覆蓋層
      overlay.style.opacity = '0';
      bgOverlay.style.opacity = '1';
      // 隱藏文字與按鈕
      if (fakerText) fakerText.style.visibility = 'hidden';
      if (buyButton) buyButton.style.visibility = 'hidden';
      setTimeout(() => {
        bgOverlay.style.opacity = '0';
        overlay.style.opacity = '1';
        // 恢復文字與按鈕
        if (fakerText) fakerText.style.visibility = 'visible';
        if (buyButton) buyButton.style.visibility = 'visible';
      }, 5000); // 顯示期間
    };
    
    // 設置定時器
    bgInterval = setInterval(showBgOverlay, 10000); // 每10秒執行一次
    
    // 創建Faker代言人區域
    const fakerArea = document.createElement('div');
    fakerArea.className = 'youtube-ad-faker';
    fakerArea.style.position = 'relative';
    fakerArea.style.zIndex = '2';
    
    // 創建Faker文字
    const fakerText = document.createElement('div');
    fakerText.className = 'faker-text';
    fakerText.innerHTML = '年度代言人faker';
    
    // 創建購買按鈕
    const buyButton = document.createElement('div');
    buyButton.className = 'buy-button';
    buyButton.innerHTML = '🔥立即遊玩🔥';
    buyButton.style.position = 'relative';
    buyButton.style.zIndex = '2';
    buyButton.addEventListener('click', () => {
      alert('立即購買功能！');
    });
    
    // 組裝Faker區域
    fakerArea.appendChild(fakerText);
    
    // 組裝footer
    footer.appendChild(bgOverlay);
    footer.appendChild(overlay);
    footer.appendChild(fakerArea);
    footer.appendChild(buyButton);
    
    // 設定透明度
    const opacity = settings.opacity || 0.9;
    videoContainer.style.opacity = opacity;
    
    // 組裝元素（將關閉按鈕附加到最外層容器，便於超出邊界顯示）
    videoContainer.appendChild(closeBtn);
    videoArea.appendChild(iframe);
    
    videoContainer.appendChild(header);
    videoContainer.appendChild(videoArea);
    videoContainer.appendChild(footer);
    
    // 使容器可拖曳
    enableDrag(videoContainer);

    // 添加到頁面
    document.body.appendChild(videoContainer);
    
    console.log('Video container added to page');
    
    // 添加動畫效果
    setTimeout(() => {
      if (videoContainer) {
        videoContainer.classList.add('show');
      }
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Error embedding video:', error);
    return false;
  }
}

// 移除影片
function removeVideo() {
  if (videoContainer) {
    // 清理定時器
    if (bgInterval) {
      clearInterval(bgInterval);
      bgInterval = null;
    }
    
    videoContainer.classList.add('hide');
    setTimeout(() => {
      if (videoContainer && videoContainer.parentNode) {
        videoContainer.parentNode.removeChild(videoContainer);
      }
      videoContainer = null;
      currentSettings = null;
    }, 300);
  }
}


// 啟用拖曳功能（Pointer Events + requestAnimationFrame）
function enableDrag(container) {
  let isDragging = false;
  let pointerId = null;
  let offsetX = 0;
  let offsetY = 0;
  let latestClientX = 0;
  let latestClientY = 0;
  let rafId = null;

  const forbiddenSelector = '.youtube-ad-close, .buy-button';

  const onPointerMove = (e) => {
    if (!isDragging || e.pointerId !== pointerId) return;
    latestClientX = e.clientX;
    latestClientY = e.clientY;
  };

  const applyPosition = () => {
    if (!isDragging) return;
    const newLeft = latestClientX - offsetX;
    const newTop = latestClientY - offsetY;

    const maxLeft = window.innerWidth - container.offsetWidth;
    const maxTop = window.innerHeight - container.offsetHeight;

    const clampedLeft = Math.min(Math.max(0, newLeft), Math.max(0, maxLeft));
    const clampedTop = Math.min(Math.max(0, newTop), Math.max(0, maxTop));

    container.style.left = clampedLeft + 'px';
    container.style.top = clampedTop + 'px';
    container.style.bottom = 'auto';
    container.style.right = 'auto';

    rafId = requestAnimationFrame(applyPosition);
  };

  const stopDragging = () => {
    if (!isDragging) return;
    isDragging = false;
    try {
      if (pointerId !== null && container.hasPointerCapture && container.hasPointerCapture(pointerId)) {
        container.releasePointerCapture(pointerId);
      }
    } catch (_) {}
    pointerId = null;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    container.classList.remove('dragging');
    document.removeEventListener('pointermove', onPointerMove, true);
    document.removeEventListener('pointerup', onPointerUp, true);
    document.removeEventListener('pointercancel', onPointerUp, true);
  };

  const onPointerUp = (e) => {
    if (e.pointerId !== pointerId) return;
    stopDragging();
  };

  const onPointerDown = (e) => {
    // 只接受主鍵
    if (e.button !== 0) return;

    // 避免在互動元素與 iframe 上開始拖曳
    const target = e.target;
    if (
      target.tagName === 'IFRAME' ||
      (target.matches && target.matches(forbiddenSelector))
    ) {
      return;
    }

    const rect = container.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    latestClientX = e.clientX;
    latestClientY = e.clientY;

    // 切換為 top/left 定位
    container.style.left = rect.left + 'px';
    container.style.top = rect.top + 'px';
    container.style.bottom = 'auto';
    container.style.right = 'auto';

    pointerId = e.pointerId;
    try { container.setPointerCapture(pointerId); } catch (_) {}

    isDragging = true;
    container.classList.add('dragging');

    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('pointercancel', onPointerUp, true);

    if (!rafId) rafId = requestAnimationFrame(applyPosition);
  };

  container.addEventListener('pointerdown', onPointerDown);
}

// 頁面載入時檢查是否有儲存的設定
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['youtubeSettings'], function(result) {
    if (result.youtubeSettings) {
      // 延遲一點時間確保頁面完全載入
      setTimeout(() => {
        embedVideo(result.youtubeSettings);
      }, 1000);
    }
  });
});
