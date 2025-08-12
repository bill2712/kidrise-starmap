document.addEventListener("DOMContentLoaded", function() {

    // --- 1. DOM 元素定義 ---
    const elements = {
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

    // --- 2. 狀態變數 ---
    let state = {
        isSkyviewActive: false,
        isArtActive: false,
        celestialData: []
    };
    
    // --- 3. 初始化所有功能 ---
    // 根據您的建議，將邏輯模組化
    initTabs();
    initMapControls();
    initObservatories();
    initCelestialMap();

    // =======================================================
    //  初始化函式區 (Initialization Functions)
    // =======================================================

    /**
     * 初始化分頁切換邏輯
     */
    function initTabs() {
        elements.tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.dataset.tab;
                elements.tabLinks.forEach(l => l.classList.remove('active'));
                elements.tabContents.forEach(c => c.classList.remove('active'));
                link.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    /**
     * 初始化星圖的主要控制按鈕
     */
    function initMapControls() {
        elements.locationButton.addEventListener('click', getLocation);
        elements.zoomInButton.addEventListener('click', () => zoom(0.8));
        elements.zoomOutButton.addEventListener('click', () => zoom(1.25));
        elements.skyviewToggleButton.addEventListener('click', toggleSkyView);
        elements.toggleArtButton.addEventListener('click', toggleConstellationArt);
        elements.searchButton.addEventListener('click', findCelestialObject);
        elements.clearButton.addEventListener('click', () => clearSearch(false));
        elements.searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') findCelestialObject(); });
    }

    /**
     * 初始化遠端天文台選擇器
     */
    function initObservatories() {
        const observatories = {
            "T11,US": { name: "New Mexico, USA", location: [32.90, -105.53] },
            "T32,AU": { name: "Siding Spring, Australia", location: [-31.27, 149.06] },
            "T7,ES": { name: "Siding Spring, Spain", location: [38.43, -2.54] }
        };
        elements.observatorySelect.addEventListener('change', () => {
            const selectedValue = elements.observatorySelect.value;
            if (!selectedValue) return;
            const obs = observatories[selectedValue];
            
            // ✅ 使用載入提示，並用 apply() 更新位置
            showLoadingMessage(`正在切換到 ${obs.name}...`);
            Celestial.apply({ location: obs.location });
            
            setTimeout(() => {
                alert(`已將觀測地點設為 ${obs.name}，現在將跳轉回「星空圖」分頁。`);
                document.querySelector('.tab-link[data-tab="starmap"]').click();
            }, 300);
        });
    }

    /**
     * 初始化並首次顯示星圖
     */
    function initCelestialMap() {
        const celestialConfig = {
            width: 0, 
            projection: "stereographic",
            transform: "equatorial",
            background: { fill: "#000", stroke: "#000" },
            datapath: "/kidrise-starmap/data/",
            interactive: true,
            zoombuttons: false,
            controls: true,
            horizon: { show: true, stroke: "#3a8fb7", width: 1.5, cardinal: true, cardinalstyle: { fill: "#87CEEB", font: "bold 16px 'Helvetica', Arial, sans-serif", offset: 14 } },
            stars: { show: true, limit: 6, colors: true, style: { fill: "#ffffff", opacity: 1, width: 1.5 }, names: true, proper: true, namelimit: 2.5, namestyle: { fill: "#ddddff", font: "14px 'Helvetica', Arial, sans-serif" } },
            planets: { show: true, which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"], symbolType: "disk", symbols: { "sol": {symbol: "☉", fill: "#ffcc00"}, "lun": {symbol: "☽", fill: "#f0f0f0"}, "mer": {symbol: "☿", fill: "#a9a9a9"}, "ven": {symbol: "♀", fill: "#f0e68c"}, "mar": {symbol: "♂", fill: "#ff4500"}, "jup": {symbol: "♃", fill: "#c2b280"}, "sat": {symbol: "♄", fill: "#f5deb3"}, "ura": {symbol: "♅", fill: "#afeeee"}, "nep": {symbol: "♆", fill: "#4169e1"}, "ter": {symbol: "♁", fill: "#0077be"} }, style: { width: 2 }, namestyle: { fill: "#f0f0f0", font: "14px 'Helvetica', Arial, sans-serif", align: "center", baseline: "middle" } },
            constellations: { show: true, names: true, namestyle: { fill: "#87CEEB", font: "16px 'Lucida Sans Unicode', sans-serif" }, lines: true, linestyle: { stroke: "#5594b8", width: 1.5, opacity: 0.8 }, images: false },
            mw: { show: true, style: { fill: "#ffffff", opacity: 0.15 } },
            callback: function(error) {
                if (error) { return console.error("Celestial Error:", error); }
                loadCelestialDataForSearch();
                setupStorybook();
                setTimeout(getLocation, 500);
            }
        };
        // ✅ 僅在初始化時呼叫 display()
        Celestial.display(celestialConfig);
    }

    // =======================================================
    //  功能函式區 (Feature Functions)
    // =======================================================

    function showLoadingMessage(message) {
        elements.messageElement.innerText = message;
        // 移除延遲清除，讓後續的操作決定何時清除訊息
    }

    function clearMessage(delay = 2000) {
        setTimeout(() => { elements.messageElement.innerText = ''; }, delay);
    }

    function setupStorybook() {
        // (此函數保持不變)
    }

    function toggleConstellationArt() {
        state.isArtActive = !state.isArtActive;
        elements.toggleArtButton.textContent = state.isArtActive ? '🎨 隱藏圖案' : '🎨 顯示圖案';
        elements.toggleArtButton.classList.toggle('active', state.isArtActive);
        
        // ✅ 使用語意化變數名
        const constellationArtConfig = {
          images: true,
          imageStyle: { width: 0.8, opacity: 0.4 },
          imageList: [ {c:"ori", f:"/kidrise-starmap/images/constellations/ori.png"}, {c:"uma", f:"/kidrise-starmap/images/constellations/uma.png"}, {c:"cas", f:"/kidrise-starmap/images/constellations/cas.png"}, {c:"sco", f:"/kidrise-starmap/images/constellations/sco.png"} ]
        };
        Celestial.apply({ constellations: state.isArtActive ? constellationArtConfig : { images: false } });
    }

    function loadCelestialDataForSearch() {
        // (此函數保持不變，內部邏輯清晰)
    }

    function findCelestialObject() {
        // ✅ 加入防呆處理
        if (!state.celestialData || state.celestialData.length === 0) {
            showLoadingMessage("資料尚未載入，請稍候再試。");
            clearMessage();
            return;
        }
        // (其餘搜尋邏輯不變)
    }
    
    function clearSearch(keepMessage = false) {
        // (此函數保持不變)
    }

    function zoom(factor) {
        // (此函數保持不變)
    }
    
    function toggleSkyView() {
        state.isSkyviewActive = !state.isSkyviewActive;
        const button = elements.skyviewToggleButton;
        button.textContent = state.isSkyviewActive ? '🛑 關閉陀螺儀' : '🔭 開啟陀螺儀';
        button.classList.toggle('active', state.isSkyviewActive);

        if (state.isSkyviewActive) {
            showLoadingMessage("正在開啟陀螺儀...");
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(state => {
                    if (state === 'granted') {
                        window.addEventListener('deviceorientation', orientationHandler);
                        Celestial.skyview({ "follow": "center" });
                        showLoadingMessage("陀螺儀已開啟！");
                        clearMessage();
                    } else { 
                        showLoadingMessage('方向感測器權限遭拒。'); 
                        clearMessage();
                        // 還原狀態
                        state.isSkyviewActive = false;
                        button.textContent = '🔭 開啟陀螺儀';
                        button.classList.remove('active');
                    }
                }).catch(console.error);
            } else {
                // ✅ 加入錯誤日誌
                if (!('ondeviceorientation' in window)) {
                    console.warn("此瀏覽器不支援 DeviceOrientationEvent。");
                    showLoadingMessage("此瀏覽器不支援陀螺儀。");
                    clearMessage();
                    // 還原狀態
                    state.isSkyviewActive = false;
                    button.textContent = '🔭 開啟陀螺儀';
                    button.classList.remove('active');
                    return;
                }
                window.addEventListener('deviceorientation', orientationHandler);
                Celestial.skyview({ "follow": "center" });
                showLoadingMessage("陀螺儀已開啟！");
                clearMessage();
            }
        } else {
            showLoadingMessage("陀螺儀已關閉。");
            window.removeEventListener('deviceorientation', orientationHandler);
            Celestial.skyview({ "follow": "none" });
            clearMessage();
        }
    }

    function orientationHandler(e) { Celestial.skyview(e); }

    function getLocation() {
        if (navigator.geolocation) {
            showLoadingMessage("正在獲取您的位置...");
            navigator.geolocation.getCurrentPosition(showPosition, showError, { timeout: 10000, enableHighAccuracy: true });
        } else { 
            showLoadingMessage("您的瀏覽器不支援定位。");
            clearMessage();
        }
    }

    function showPosition(position) {
        const { latitude, longitude } = position.coords;
        // ✅ 使用 apply() 更新位置
        Celestial.apply({ location: [latitude, longitude], local: true });
        showLoadingMessage(`已更新為您的位置！`);
        clearMessage();
    }

    function showError(error) {
        const errors = { 1: '您已拒絕位置請求。', 2: '無法獲取當前位置。', 3: '獲取位置超時。' };
        showLoadingMessage(errors[error.code] || '獲取位置時發生未知錯誤。');
        clearMessage();
    }
    
    // (Modal 相關函數保持不變)
    window.showStoryModal = function(title, imageSrc, story) {
        // ...
    };
    window.closeStoryModal = function() {
        // ...
    };
    window.onclick = function(event) {
        // ...
    };

    // 由於上面已經將所有邏輯拆分到獨立函式中，這裡貼上未省略的完整函式定義
    // (此處省略以保持簡潔，但實際檔案中應包含完整的函式定義)
    // ... (此處應貼上 setupStorybook, loadCelestialDataForSearch, findCelestialObject, clearSearch, showStoryModal 等完整函式)

});
