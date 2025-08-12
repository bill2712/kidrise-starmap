document.addEventListener("DOMContentLoaded", function() {

    // ✅ 穩定性升級：守衛 Celestial 是否存在
    if (typeof Celestial === "undefined") {
        console.error("核心星圖函式庫 Celestial 未能成功載入，請檢查網路連線或 lib 資料夾中的檔案路徑。");
        // 可以在此處向使用者顯示一個更友好的錯誤訊息
        const container = document.querySelector(".content-container");
        if (container) container.innerHTML = "<h1>抱歉，星圖核心元件載入失敗</h1><p>請檢查您的網路連線，或確認專案檔案是否完整。</p>";
        return;
    }

    // ✅ 變數命名：ui 代表所有 UI 元素，state 代表所有狀態
    const ui = {
        tabLinks: document.querySelectorAll('.tab-link'),
        tabContents: document.querySelectorAll('.tab-content'),
        observatorySelect: document.getElementById('observatory-select'),
        messageElement: document.getElementById('message'),
        locationButton: document.getElementById('locationButton'),
        skyviewToggleButton: document.getElementById('skyview-toggle'),
        toggleArtButton: document.getElementById('toggle-art-button'),
        zoomInButton: document.getElementById('zoom-in'),
        zoomOutButton: document.getElementById('zoom-out'),
        searchInput: document.getElementById('search-input'),
        searchButton: document.getElementById('search-button'),
        clearButton: document.getElementById('clear-button'),
        datalist: document.getElementById('celestial-objects'),
        storyModal: document.getElementById('storyModal')
    };

    let state = {
        isSkyviewActive: false,
        isArtActive: false,
        celestialData: [],
        orientationLastUpdate: 0
    };
    
    // --- 初始化所有功能 ---
    initTabs();
    initMapControls();
    initObservatories();
    initCelestialMap();
    initModals();

    // =======================================================
    //  初始化函式區 (Initialization Functions)
    // =======================================================

    function initTabs() {
        ui.tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.dataset.tab;
                ui.tabLinks.forEach(l => l.classList.remove('active'));
                ui.tabContents.forEach(c => c.classList.remove('active'));
                link.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    function initMapControls() {
        ui.locationButton.addEventListener('click', getLocation);
        // ✅ 功能補齊：實作 Zoom 按鈕
        ui.zoomInButton.addEventListener('click', () => zoomBy(0.8)); // 數字 < 1 為放大
        ui.zoomOutButton.addEventListener('click', () => zoomBy(1.25)); // 數字 > 1 為縮小
        ui.skyviewToggleButton.addEventListener('click', toggleSkyView);
        ui.toggleArtButton.addEventListener('click', toggleConstellationArt);
        // ✅ 功能補齊：綁定新的搜尋與清除函式
        ui.searchButton.addEventListener('click', searchNow);
        ui.searchInput.addEventListener('keyup', (evt) => { if (evt.key === "Enter") searchNow(); });
        ui.clearButton.addEventListener('click', clearSearch);
    }

    function initObservatories() {
        const observatories = {
            "T11,US": { name: "New Mexico, USA", location: [32.90, -105.53] },
            "T32,AU": { name: "Siding Spring, Australia", location: [-31.27, 149.06] },
            "T7,ES": { name: "Siding Spring, Spain", location: [38.43, -2.54] }
        };
        ui.observatorySelect.addEventListener('change', () => {
            const selectedValue = ui.observatorySelect.value;
            if (!selectedValue) return;
            const obs = observatories[selectedValue];
            
            showMessage(`正在切換到 ${obs.name}...`);
            // ✅ 細節優化：切換地點時使用 local: true
            Celestial.apply({ location: obs.location, local: true });
            
            setTimeout(() => {
                alert(`已將觀測地點設為 ${obs.name}，現在將跳轉回「星空圖」分頁。`);
                document.querySelector('.tab-link[data-tab="starmap"]').click();
                clearMessage(1000);
            }, 300);
        });
    }

    function initCelestialMap() {
        const celestialConfig = {
            // (Config 內容保持不變)
            width: 0, projection: "stereographic", transform: "equatorial", background: { fill: "#000", stroke: "#000" }, datapath: "/kidrise-starmap/data/", interactive: true, zoombuttons: false, controls: true,
            horizon: { show: true, stroke: "#3a8fb7", width: 1.5, cardinal: true, cardinalstyle: { fill: "#87CEEB", font: "bold 16px 'Helvetica', Arial, sans-serif", offset: 14 } },
            stars: { show: true, limit: 6, colors: true, style: { fill: "#ffffff", opacity: 1, width: 1.5 }, names: true, proper: true, namelimit: 2.5, namestyle: { fill: "#ddddff", font: "14px 'Helvetica', Arial, sans-serif" } },
            planets: { show: true, which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"], symbolType: "disk", symbols: { "sol": {symbol: "☉", fill: "#ffcc00"}, "lun": {symbol: "☽", fill: "#f0f0f0"}, "mer": {symbol: "☿", fill: "#a9a9a9"}, "ven": {symbol: "♀", fill: "#f0e68c"}, "mar": {symbol: "♂", fill: "#ff4500"}, "jup": {symbol: "♃", fill: "#c2b280"}, "sat": {symbol: "♄", fill: "#f5deb3"}, "ura": {symbol: "♅", fill: "#afeeee"}, "nep": {symbol: "♆", fill: "#4169e1"}, "ter": {symbol: "♁", fill: "#0077be"} }, style: { width: 2 }, namestyle: { fill: "#f0f0f0", font: "14px 'Helvetica', Arial, sans-serif", align: "center", baseline: "middle" } },
            constellations: { show: true, names: true, namestyle: { fill: "#87CEEB", font: "16px 'Lucida Sans Unicode', sans-serif" }, lines: true, linestyle: { stroke: "#5594b8", width: 1.5, opacity: 0.8 }, images: false },
            mw: { show: true, style: { fill: "#ffffff", opacity: 0.15 } },
            // ✅ 功能補齊：Callback 中呼叫新的 buildSearchIndex 函式
            callback: function (err) {
              if (err) { console.error("Celestial Error:", err); return; }
              buildSearchIndex();
              setupStorybook();
              setTimeout(getLocation, 500);
            }
        };
        Celestial.display(celestialConfig);
    }

    // ✅ 功能補齊：初始化 Modal 相關行為
    function initModals() {
        window.showStoryModal = function (title, imgSrc, text) {
            const modal = ui.storyModal;
            if (!modal) return;
            modal.querySelector("#modalTitle").innerText = title;
            modal.querySelector("#modalImage").src = imgSrc;
            modal.querySelector("#modalStory").innerText = text;
            modal.style.display = "flex";
        };
        window.closeStoryModal = function () {
            const modal = ui.storyModal;
            if (modal) modal.style.display = "none";
        };
        // ✅ 事件參數命名：統一為 evt
        window.addEventListener("click", (evt) => {
            if (evt.target === ui.storyModal) window.closeStoryModal();
        });
    }
    
    // =======================================================
    //  功能函式區 (Feature Functions)
    // =======================================================

    function showMessage(message) { ui.messageElement.innerText = message; }
    function clearMessage(delay = 2000) { setTimeout(() => { ui.messageElement.innerText = ''; }, delay); }

    function setupStorybook() { /* (此函數保持不變) */ }
    
    // ✅ 功能補齊：新的 Zoom 函式
    function zoomBy(factor) {
      const currentScale = Celestial.zoom.scale();
      const center = [window.innerWidth / 2, window.innerHeight / 2];
      Celestial.zoom.to(currentScale * factor, center);
    }

    function toggleConstellationArt() {
        state.isArtActive = !state.isArtActive;
        ui.toggleArtButton.textContent = state.isArtActive ? '🎨 隱藏圖案' : '🎨 顯示圖案';
        ui.toggleArtButton.classList.toggle('active', state.isArtActive);
        
        const constellationArtConfig = {
          images: true, imageStyle: { width: 0.8, opacity: 0.4 },
          imageList: [ {c:"ori", f:"/kidrise-starmap/images/constellations/ori.png"}, {c:"uma", f:"/kidrise-starmap/images/constellations/uma.png"}, {c:"cas", f:"/kidrise-starmap/images/constellations/cas.png"}, {c:"sco", f:"/kidrise-starmap/images/constellations/sco.png"} ]
        };
        Celestial.apply({ constellations: state.isArtActive ? constellationArtConfig : { images: false } });
    }

    // ✅ 功能補齊：新的搜尋索引建立函式
    function buildSearchIndex() {
      state.celestialData = [];
      if (Celestial.constellations) { Celestial.constellations.forEach(c => state.celestialData.push({ name: c.name, type: "constellation", id: c.id })); }
      if (Celestial.data?.stars?.features) { Celestial.data.stars.features.forEach(f => { const nm = f.properties?.name; if (nm) state.celestialData.push({ name: nm, type: "star", id: f.id }); }); }
      ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune"].forEach(p => state.celestialData.push({ name: p, type: "planet" }));
      ui.datalist.innerHTML = state.celestialData.map(item => `<option value="${item.name}"></option>`).join("");
    }

    // ✅ 功能補齊：新的搜尋執行函式
    function searchNow() {
      if (!state.celestialData || state.celestialData.length === 0) { showMessage("資料尚未載入，請稍候再試。"); clearMessage(); return; }
      const query = ui.searchInput.value.trim();
      if (!query) return;
      const item = state.celestialData.find(x => x.name.toLowerCase() === query.toLowerCase());
      if (!item) { showMessage(`抱歉，資料庫中沒有 "${query}"。`); clearMessage(); return; }
      const res = Celestial.search({ type: item.type, name: item.name, id: item.id });
      if (!res) { showMessage(`抱歉，找不到 ${item.name} 的座標。`); clearMessage(); return; }
      Celestial.remove("search-target");
      Celestial.add({ type: "Point", id: "search-target", geometry: { type: "Point", coordinates: [res.ra, res.dec] }, properties: { size: 20, style: { class: "target-indicator" } } });
      Celestial.redraw();
      ui.clearButton.classList.remove("hidden");
      showMessage(`為您標示 ${item.name}...`); clearMessage(3000);
    }
    
    // ✅ 功能補齊：新的清除搜尋函式
    function clearSearch() {
      Celestial.remove("search-target");
      Celestial.redraw();
      ui.searchInput.value = "";
      ui.clearButton.classList.add("hidden");
      showMessage("");
    }
    
    function toggleSkyView() {
        state.isSkyviewActive = !state.isSkyviewActive;
        const button = ui.skyviewToggleButton;
        button.textContent = state.isSkyviewActive ? '🛑 關閉陀螺儀' : '🔭 開啟陀螺儀';
        button.classList.toggle('active', state.isSkyviewActive);
        if (state.isSkyviewActive) {
            showMessage("正在開啟陀螺儀...");
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // ✅ Bug 修正：使用 perm 參數，並正確設定 state.isSkyviewActive
                DeviceOrientationEvent.requestPermission().then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', orientationHandler, { passive: true });
                        Celestial.skyview({ "follow": "center" });
                        showMessage("陀螺儀已開啟！"); clearMessage();
                    } else { 
                        showMessage('方向感測器權限遭拒。'); clearMessage();
                        state.isSkyviewActive = false; // 正確修改狀態
                        button.textContent = '🔭 開啟陀螺儀';
                        button.classList.remove('active');
                    }
                }).catch(console.error);
            } else {
                if (!('ondeviceorientation' in window)) { console.warn("此瀏覽器不支援 DeviceOrientationEvent。"); showMessage("此瀏覽器不支援陀螺儀。"); clearMessage(); state.isSkyviewActive = false; button.textContent = '🔭 開啟陀螺儀'; button.classList.remove('active'); return; }
                window.addEventListener('deviceorientation', orientationHandler, { passive: true });
                Celestial.skyview({ "follow": "center" });
                showMessage("陀螺儀已開啟！"); clearMessage();
            }
        } else {
            showMessage("陀螺儀已關閉。");
            window.removeEventListener('deviceorientation', orientationHandler);
            Celestial.skyview({ "follow": "none" });
            clearMessage();
        }
    }

    // ✅ 效能提升：加入節流閥
    function orientationHandler(evt) {
      const now = performance.now();
      if (now - state.orientationLastUpdate < 50) return; // ~20fps
      state.orientationLastUpdate = now;
      Celestial.skyview(evt);
    }

    function getLocation() {
        if (navigator.geolocation) {
            showMessage("正在獲取您的位置...");
            navigator.geolocation.getCurrentPosition(showPosition, showError, { timeout: 10000, enableHighAccuracy: true });
        } else { showMessage("您的瀏覽器不支援定位。"); clearMessage(); }
    }

    function showPosition(position) {
        const { latitude, longitude } = position.coords;
        Celestial.apply({ location: [latitude, longitude], local: true });
        showMessage(`已更新為您的位置！`);
        clearMessage();
    }

    function showError(error) {
        const errors = { 1: '您已拒絕位置請求。', 2: '無法獲取當前位置。', 3: '獲取位置超時。' };
        showMessage(errors[error.code] || '獲取位置時發生未知錯誤。');
        clearMessage();
    }

    // setupStorybook 和 Modal 相關函式由於在 init 中呼叫，此處省略重複程式碼
    // 請確認已將上方 initModals() 函式與下方的 setupStorybook() 複製到您的檔案中
    function setupStorybook() {
        const storybookContainer = document.createElement('div');
        storybookContainer.className = 'storybook-grid';
        const templates = document.getElementById('storybook-templates');
        if (templates) {
            storybookContainer.innerHTML = templates.innerHTML;
            const knowledgeTab = document.getElementById('knowledge');
            if (knowledgeTab) {
                const section = knowledgeTab.querySelector('.section');
                if(section) {
                    const title = document.createElement('h2');
                    title.textContent = '星座故事書';
                    section.appendChild(title);
                    section.appendChild(storybookContainer);
                }
            }
        }
    }
});
