// map.js (簡化版)

document.addEventListener("DOMContentLoaded", function() {

    // 守衛 Celestial 是否存在
    if (typeof Celestial === "undefined") {
        console.error("核心星圖函式庫 Celestial 未能成功載入。");
        const mapContainer = document.getElementById("starmap-container");
        if(mapContainer) mapContainer.innerHTML = "<h1>抱歉，星圖核心元件載入失敗</h1><p>請檢查您的網路連線，或確認專案檔案是否完整。</p>";
        return;
    }

    // --- UI 元素定義 (已簡化) ---
    const ui = {
        messageElement: document.getElementById('message'),
        locationButton: document.getElementById('locationButton'),
        zoomInButton: document.getElementById('zoom-in'),
        zoomOutButton: document.getElementById('zoom-out'),
    };

    // --- 星圖設定 (已簡化) ---
    const celestialConfig = {
        width: 0, projection: "stereographic", transform: "equatorial", background: { fill: "#000", stroke: "#000" }, datapath: "/kidrise-starmap/data/", interactive: true, zoombuttons: false,
        horizon: { show: true, stroke: "#3a8fb7", width: 1.5, cardinal: true, cardinalstyle: { fill: "#87CEEB", font: "bold 16px 'Helvetica', Arial, sans-serif", offset: 14 } },
        stars: { show: true, limit: 6, colors: true, style: { fill: "#ffffff", opacity: 1, width: 1.5 }, names: true, proper: true, namelimit: 2.5, namestyle: { fill: "#ddddff", font: "14px 'Helvetica', Arial, sans-serif" } },
        planets: { show: true, which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"], symbolType: "disk", symbols: { "sol": {symbol: "☉", fill: "#ffcc00"}, "lun": {symbol: "☽", fill: "#f0f0f0"}, "mer": {symbol: "☿", fill: "#a9a9a9"}, "ven": {symbol: "♀", fill: "#f0e68c"}, "mar": {symbol: "♂", fill: "#ff4500"}, "jup": {symbol: "♃", fill: "#c2b280"}, "sat": {symbol: "♄", fill: "#f5deb3"}, "ura": {symbol: "♅", fill: "#afeeee"}, "nep": {symbol: "♆", fill: "#4169e1"}, "ter": {symbol: "♁", fill: "#0077be"} }, style: { width: 2 }, namestyle: { fill: "#f0f0f0", font: "14px 'Helvetica', Arial, sans-serif", align: "center", baseline: "middle" } },
        constellations: { show: true, names: true, namestyle: { fill: "#87CEEB", font: "16px 'Lucida Sans Unicode', sans-serif" }, lines: true, linestyle: { stroke: "#5594b8", width: 1.5, opacity: 0.8 } },
        mw: { show: true, style: { fill: "#ffffff", opacity: 0.15 } },
        callback: function (err) {
          if (err) { return console.error("Celestial Error:", err); }
          
          const savedLocation = localStorage.getItem('plannerLocation');
          if (savedLocation) {
              const loc = JSON.parse(savedLocation);
              showMessage(`正在顯示 ${loc.name} 的星空...`, 3000);
              Celestial.apply({ location: loc.location, local: true });
              localStorage.removeItem('plannerLocation');
          } else {
              setTimeout(getLocation, 500);
          }
        }
    };

    // --- 初始化 ---
    Celestial.display(celestialConfig);

    // --- 事件監聽 (已簡化) ---
    ui.locationButton.addEventListener('click', getLocation);
    ui.zoomInButton.addEventListener('click', () => zoomBy(0.8));
    ui.zoomOutButton.addEventListener('click', () => zoomBy(1.25));
    
    // =======================================================
    //  功能函式區 (Feature Functions)
    // =======================================================

    function showMessage(message, duration = 2000) {
        ui.messageElement.innerText = message;
        if (duration > 0) {
            setTimeout(() => { ui.messageElement.innerText = ''; }, duration);
        }
    }
    
    function zoomBy(factor) {
      const currentScale = Celestial.zoom.scale();
      const center = [window.innerWidth / 2, window.innerHeight / 2];
      Celestial.zoom.to(currentScale * factor, center);
    }

    function getLocation() {
        if (navigator.geolocation) {
            showMessage("正在獲取您的位置...", 0);
            navigator.geolocation.getCurrentPosition(showPosition, showError, { timeout: 10000, enableHighAccuracy: true });
        } else { 
            showMessage("您的瀏覽器不支援定位。");
        }
    }

    function showPosition(position) {
        const { latitude, longitude } = position.coords;
        Celestial.apply({ location: [latitude, longitude], local: true });
        showMessage(`已更新為您的位置！`);
    }

    function showError(error) {
        const errors = { 1: '您已拒絕位置請求。', 2: '無法獲取當前位置。', 3: '獲取位置超時。' };
        showMessage(errors[error.code] || '獲取位置時發生未知錯誤。');
    }
});
