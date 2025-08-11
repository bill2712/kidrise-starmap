document.addEventListener("DOMContentLoaded", function() {

    // --- 元素定義 ---
    const toggleArtButton = document.getElementById('toggle-art-button');
    // (其他元素定義保持不變)
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const observatorySelect = document.getElementById('observatory-select');
    const messageElement = document.getElementById('message');
    const locationButton = document.getElementById('locationButton');
    const skyviewToggleButton = document.getElementById('skyview-toggle');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearButton = document.getElementById('clear-button');
    const datalist = document.getElementById('celestial-objects');
    const storyModal = document.getElementById('storyModal');
    
    // --- 狀態變數 ---
    let isSkyviewActive = false;
    let isArtActive = false; // 新增：追蹤星座圖案是否開啟
    let celestialData = [];

    // --- 星圖設定 (視覺優化) ---
    const celestialConfig = {
        // --- 既有設定 ---
        width: 0, 
        projection: "stereographic",
        transform: "equatorial",
        background: { fill: "#000", stroke: "#000" },
        datapath: "/kidrise-starmap/data/",
        interactive: true,
        zoombuttons: false,
        controls: true,
        // --- 視覺優化 START ---
        stars: {
            show: true, limit: 6, colors: true,
            style: { fill: "#ffffff", opacity: 1, width: 1.5 }, // 稍微加粗星星
            names: true, proper: true, namelimit: 2.5,
            namestyle: { fill: "#ddddff", font: "14px 'Helvetica', Arial, sans-serif" } // 加大名稱字體
        },
        planets: {
            show: true, symbolType: "disk",
            style: { width: 2 } // 稍微加粗行星
        },
        constellations: {
            show: true, names: true,
            namestyle: { fill: "#87CEEB", font: "16px 'Lucida Sans Unicode', sans-serif" }, // 加大星座名稱
            lines: true,
            linestyle: { stroke: "#5594b8", width: 1.5, opacity: 0.8 }, // 稍微加粗線條
            // **全新：預設不顯示星座圖案**
            images: false 
        },
        // --- 視覺優化 END ---
        horizon: {
            show: true,
            stroke: "#3a8fb7",
            width: 1.5,
            cardinal: true,
            cardinalstyle: { fill: "#87CEEB", font: "bold 16px 'Helvetica', Arial, sans-serif", offset: 14 }
        },
        mw: {
            show: true,
            style: { fill: "#ffffff", opacity: 0.15 }
        },
        callback: function(error) {
            if (error) { console.error("Celestial Error:", error); return; }
            loadCelestialDataForSearch();
            setTimeout(getLocation, 500);
        }
    };
    
    // **全新：定義星座圖案的設定**
    const constellationArt = {
      images: true,
      imageStyle: {
        width: 0.8,  // 圖片縮放比例
        opacity: 0.4 // 圖片透明度
      },
      // 圖片與星座的對應關係
      imageList: [
        {c:"ori", f:"/kidrise-starmap/images/constellations/ori.png"},
        {c:"uma", f:"/kidrise-starmap/images/constellations/uma.png"},
        {c:"cas", f:"/kidrise-starmap/images/constellations/cas.png"},
        {c:"sco", f:"/kidrise-starmap/images/constellations/sco.png"}
      ]
    };

    // --- 初始化星圖 ---
    Celestial.display(celestialConfig);
    
    // --- 事件監聽 ---
    // (除了新增的 toggleArtButton，其他保持不變)
    toggleArtButton.addEventListener('click', toggleConstellationArt);
    
    // --- 新功能函數：切換星座圖案 ---
    function toggleConstellationArt() {
        isArtActive = !isArtActive; // 切換狀態

        if (isArtActive) {
            toggleArtButton.textContent = '🎨 隱藏圖案';
            toggleArtButton.classList.add('active');
            // 套用星座圖案設定
            Celestial.apply({ constellations: constellationArt });
        } else {
            toggleArtButton.textContent = '🎨 顯示圖案';
            toggleArtButton.classList.remove('active');
            // 移除星座圖案設定 (恢復成 config 的預設值)
            Celestial.apply({ constellations: { images: false } });
        }
    }

    //
    // ===================================================================
    // ||                                                               ||
    // ||   所有其他既有的程式碼 (分頁邏輯、尋星、定位等) 在此保持不變     ||
    // ||                                                               ||
    // ===================================================================
    //
    
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
        if (selectedValue && observatories[selectedValue]) {
            const obs = observatories[selectedValue];
            const starMapMessage = document.getElementById('message');
            starMapMessage.innerText = `地點已設為 ${obs.name}`;
            Celestial.display({ location: obs.location });
            setTimeout(() => {
                alert(`已將觀測地點設為 ${obs.name}，現在將跳轉回「星空圖」分頁。`);
                document.querySelector('.tab-link[data-tab="starmap"]').click();
                setTimeout(() => { starMapMessage.innerText = ''; }, 3000);
            }, 300);
        }
    });
    
    locationButton.addEventListener('click', getLocation);
    zoomInButton.addEventListener('click', () => zoom(0.8));
    zoomOutButton.addEventListener('click', () => zoom(1.25));
    skyviewToggleButton.addEventListener('click', toggleSkyView);
    searchButton.addEventListener('click', findCelestialObject);
    clearButton.addEventListener('click', () => clearSearch(false));
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') findCelestialObject(); });

    function loadCelestialDataForSearch() {
        celestialData = [];
        if (Celestial.constellations) {
            Celestial.constellations.forEach(c => celestialData.push({ name: c.name, type: 'constellation', id: c.id }));
        }
        if (Celestial.data.stars) {
            Celestial.data.stars.features.forEach(s => {
                if (s.properties?.name) celestialData.push({ name: s.properties.name, type: 'star', id: s.id });
            });
        }
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
                Celestial.add({
                    type: "Point", id: "search-target",
                    geometry: { type: "Point", coordinates: [coords.ra, coords.dec] },
                    properties: { "size": 20, "style": { "class": "target-indicator" } }
                });
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
        setTimeout(() => messageElement.innerText = '', 3000);
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
        const modalTitle = document.getElementById('modalTitle');
        const modalImage = document.getElementById('modalImage');
        const modalStory = document.getElementById('modalStory');

        if(modalTitle) modalTitle.innerText = title;
        if(modalImage) modalImage.src = imageSrc;
        if(modalStory) modalStory.innerText = story;
        if (storyModal) storyModal.style.display = 'flex';
    };
    window.closeStoryModal = function() {
        if (storyModal) storyModal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target == storyModal) closeStoryModal();
    };
});
