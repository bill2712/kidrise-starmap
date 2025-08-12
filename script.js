// --- 最終版 script.js ---
// 這個腳本的結構，確保了 celestialConfig 在被使用前已被完整定義，
// 正好符合您的專業建議，從而避免了潛在的 undefined 錯誤。

document.addEventListener("DOMContentLoaded", function() {

    // --- 元素定義 ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const observatorySelect = document.getElementById('observatory-select');
    const messageElement = document.getElementById('message');
    const locationButton = document.getElementById('locationButton');
    const skyviewToggleButton = document.getElementById('skyview-toggle');
    const toggleArtButton = document.getElementById('toggle-art-button');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearButton = document.getElementById('clear-button');
    const datalist = document.getElementById('celestial-objects');
    const storyModal = document.getElementById('storyModal');
    
    // --- 狀態變數 ---
    let isSkyviewActive = false;
    let isArtActive = false;
    let celestialData = [];

    // --- 星圖設定 (完整且有效的物件) ---
    // 根據您的建議，我們在此處完整定義 celestialConfig，確保它在傳遞給 display() 前是一個有效的物件
    const celestialConfig = {
        width: 0, 
        projection: "stereographic",
        transform: "equatorial",
        background: { fill: "#000", stroke: "#000" },
        datapath: "/kidrise-starmap/data/",
        interactive: true,
        zoombuttons: false,
        controls: true,
        horizon: {
            show: true, stroke: "#3a8fb7", width: 1.5,
            cardinal: true,
            cardinalstyle: { fill: "#87CEEB", font: "bold 16px 'Helvetica', Arial, sans-serif", offset: 14 }
        },
        stars: {
            show: true, limit: 6, colors: true,
            style: { fill: "#ffffff", opacity: 1, width: 1.5 },
            names: true, proper: true, namelimit: 2.5,
            namestyle: { fill: "#ddddff", font: "14px 'Helvetica', Arial, sans-serif" }
        },
        planets: {
            show: true, 
            which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"],
            symbolType: "disk",
            symbols: {
              "sol": {symbol: "☉", fill: "#ffcc00"}, "lun": {symbol: "☽", fill: "#f0f0f0"},
              "mer": {symbol: "☿", fill: "#a9a9a9"}, "ven": {symbol: "♀", fill: "#f0e68c"},
              "mar": {symbol: "♂", fill: "#ff4500"}, "jup": {symbol: "♃", fill: "#c2b280"},
              "sat": {symbol: "♄", fill: "#f5deb3"}, "ura": {symbol: "♅", fill: "#afeeee"},
              "nep": {symbol: "♆", fill: "#4169e1"}, "ter": {symbol: "♁", fill: "#0077be"}
            },
            style: { width: 2 },
            namestyle: { fill: "#f0f0f0", font: "14px 'Helvetica', Arial, sans-serif", align: "center", baseline: "middle" }
        },
        constellations: {
            show: true, names: true,
            namestyle: { fill: "#87CEEB", font: "16px 'Lucida Sans Unicode', sans-serif" },
            lines: true,
            linestyle: { stroke: "#5594b8", width: 1.5, opacity: 0.8 },
            images: false
        },
        mw: {
            show: true, style: { fill: "#ffffff", opacity: 0.15 }
        },
        callback: function(error) {
            if (error) { console.error("Celestial Error:", error); return; }
            loadCelestialDataForSearch();
            setupStorybook();
            setTimeout(getLocation, 500);
        }
    };
    
    // 星座圖案設定
    const constellationArt = {
      images: true,
      imageStyle: { width: 0.8, opacity: 0.4 },
      imageList: [
        {c:"ori", f:"/kidrise-starmap/images/constellations/ori.png"},
        {c:"uma", f:"/kidrise-starmap/images/constellations/uma.png"},
        {c:"cas", f:"/kidrise-starmap/images/constellations/cas.png"},
        {c:"sco", f:"/kidrise-starmap/images/constellations/sco.png"}
      ]
    };

    // --- 初始化星圖 ---
    // 此時 celestialConfig 是一個完整的物件，可以安全地傳入
    Celestial.display(celestialConfig);
    
    // --- 事件監聽 ---
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.dataset.tab;
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    const observatories = {
        "T11,US": { name: "New Mexico, USA", location: [32.90, -105.53] },
        "T32,AU": { name: "Siding Spring, Australia", location: [-31.27, 149.06] },
        "T7,ES": { name: "Siding Spring, Spain", location: [38.43, -2.54] }
    };
    observatorySelect.addEventListener('change', () => {
        const selectedValue = observatorySelect.value;
        if (!selectedValue) return;
        const obs = observatories[selectedValue];
        messageElement.innerText = `地點已設為 ${obs.name}`;
        // 我們在這裡傳入一個新的設定物件來更新地點，而不是修改 celestialConfig
        Celestial.display({ location: obs.location }); 
        setTimeout(() => {
            alert(`已將觀測地點設為 ${obs.name}，現在將跳轉回「星空圖」分頁。`);
            document.querySelector('.tab-link[data-tab="starmap"]').click();
            setTimeout(() => { messageElement.innerText = ''; }, 3000);
        }, 300);
    });
    
    locationButton.addEventListener('click', getLocation);
    zoomInButton.addEventListener('click', () => zoom(0.8));
    zoomOutButton.addEventListener('click', () => zoom(1.25));
    skyviewToggleButton.addEventListener('click', toggleSkyView);
    toggleArtButton.addEventListener('click', toggleConstellationArt);
    searchButton.addEventListener('click', findCelestialObject);
    clearButton.addEventListener('click', () => clearSearch(false));
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') findCelestialObject(); });

    // --- 功能函數 ---
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

    function toggleConstellationArt() {
        isArtActive = !isArtActive;
        toggleArtButton.textContent = isArtActive ? '🎨 隱藏圖案' : '🎨 顯示圖案';
        toggleArtButton.classList.toggle('active', isArtActive);
        Celestial.apply({ constellations: isArtActive ? constellationArt : { images: false } });
    }

    function loadCelestialDataForSearch() {
        celestialData = [];
        if (Celestial.constellations) Celestial.constellations.forEach(c => celestialData.push({ name: c.name, type: 'constellation', id: c.id }));
        if (Celestial.data.stars) Celestial.data.stars.features.forEach(s => { if (s.properties?.name) celestialData.push({ name: s.properties.name, type: 'star', id: s.id }); });
        const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
        planets.forEach(p => celestialData.push({ name: p, type: 'planet' }));
        datalist.innerHTML = celestialData.map(item => `<option value="${item.name}"></option>`).join('');
    }

    function findCelestialObject() {
        const query = searchInput.value.trim();
        if (query === "") return;
        const target = celestialData.find(item => item.name.toLowerCase() === query.toLowerCase());

        if (target) {
            clearSearch(true);
            const coords = Celestial.search({ type: target.type, name: target.name, id: target.id });
            if (coords) {
                messageElement.innerText = `為您標示 ${target.name}...`;
                Celestial.add({ type: "Point", id: "search-target", geometry: { type: "Point", coordinates: [coords.ra, coords.dec] }, properties: { "size": 20, "style": { "class": "target-indicator" } } });
                Celestial.redraw();
                clearButton.classList.remove('hidden');
            } else { messageElement.innerText = `抱歉，找不到 ${target.name} 的座標。`; }
        } else { messageElement.innerText = `抱歉，資料庫中沒有 "${query}"。`; }
        setTimeout(() => messageElement.innerText = '', 3000);
    }
    
    function clearSearch(keepMessage = false) {
        Celestial.remove("search-target");
        Celestial.redraw();
        searchInput.value = '';
        clearButton.classList.add('hidden');
        if (!keepMessage) messageElement.innerText = '';
    }

    function zoom(factor) {
        const currentScale = Celestial.zoom.scale();
        const center = [document.body.clientWidth / 2, document.body.clientHeight / 2];
        Celestial.zoom.to(currentScale * factor, center);
    }
    
    function toggleSkyView() {
        isSkyviewActive = !isSkyviewActive;
        skyviewToggleButton.textContent = isSkyviewActive ? '🛑 關閉陀螺儀' : '🔭 開啟陀螺儀';
        skyviewToggleButton.classList.toggle('active', isSkyviewActive);

        if (isSkyviewActive) {
            messageElement.innerText = "陀螺儀已開啟！";
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(state => {
                    if (state === 'granted') {
                        window.addEventListener('deviceorientation', orientationHandler);
                        Celestial.skyview({ "follow": "center" });
                    } else { 
                        messageElement.innerText = '方向感測器權限遭拒。'; 
                        isSkyviewActive = false;
                        skyviewToggleButton.textContent = '🔭 開啟陀螺儀';
                        skyviewToggleButton.classList.remove('active');
                    }
                }).catch(console.error);
            } else {
                window.addEventListener('deviceorientation', orientationHandler);
                Celestial.skyview({ "follow": "center" });
            }
        } else {
            messageElement.innerText = "陀螺儀已關閉。";
            window.removeEventListener('deviceorientation', orientationHandler);
            Celestial.skyview({ "follow": "none" });
        }
        setTimeout(() => { messageElement.innerText = ''; }, 3000);
    }

    function orientationHandler(e) { Celestial.skyview(e); }

    function getLocation() {
        if (navigator.geolocation) {
            messageElement.innerText = "正在獲取您的位置...";
            navigator.geolocation.getCurrentPosition(showPosition, showError, { timeout: 10000, enableHighAccuracy: true });
        } else { messageElement.innerText = "您的瀏覽器不支援定位。"; }
    }

    function showPosition(position) {
        const { latitude, longitude } = position.coords;
        messageElement.innerText = `已更新為您的位置！`;
        Celestial.display({ location: [latitude, longitude], local: true });
        setTimeout(() => messageElement.innerText = '', 3000);
    }

    function showError(error) {
        const errors = { 1: '您已拒絕位置請求。', 2: '無法獲取當前位置。', 3: '獲取位置超時。' };
        messageElement.innerText = errors[error.code] || '獲取位置時發生未知錯誤。';
    }
    
    window.showStoryModal = function(title, imageSrc, story) {
        document.getElementById('modalTitle').innerText = title;
        document.getElementById('modalImage').src = imageSrc;
        document.getElementById('modalStory').innerText = story;
        if (storyModal) storyModal.style.display = 'flex';
    };
    window.closeStoryModal = function() {
        if (storyModal) storyModal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target == storyModal) closeStoryModal();
    };
});
