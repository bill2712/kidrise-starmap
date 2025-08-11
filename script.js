document.addEventListener("DOMContentLoaded", function() {

    // --- 元素定義 ---
    // 分頁系統
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 星空圖頁面
    const messageElement = document.getElementById('message');
    const locationButton = document.getElementById('locationButton');
    const skyviewToggleButton = document.getElementById('skyview-toggle');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearButton = document.getElementById('clear-button');
    const datalist = document.getElementById('celestial-objects');
    
    // 目標規劃頁面
    const observatorySelect = document.getElementById('observatory-select');

    // 故事書 Modal
    const storyModal = document.getElementById('storyModal');
    
    // --- 狀態變數 ---
    let isSkyviewActive = false;
    let celestialData = [];

    // --- 初始化與事件監聽 ---

    // 1. 分頁切換邏輯
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.dataset.tab;
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 2. 遠端天文台選擇邏輯
    const observatories = {
        "T11,US": { name: "New Mexico, USA", location: [32.90, -105.53] },
        "T32,AU": { name: "Siding Spring, Australia", location: [-31.27, 149.06] },
        "T7,ES": { name: "Siding Spring, Spain", location: [38.43, -2.54] }
    };
    observatorySelect.addEventListener('change', () => {
        const selectedValue = observatorySelect.value;
        if (selectedValue && observatories[selectedValue]) {
            const obs = observatories[selectedValue];
            // 在星圖的訊息列上顯示提示
            const starMapMessage = document.getElementById('message');
            starMapMessage.innerText = `地點已設為 ${obs.name}`;
            
            Celestial.display({ location: obs.location });
            
            // 短暫延遲後提示用戶，並自動跳轉
            setTimeout(() => {
                alert(`已將觀測地點設為 ${obs.name}，現在將跳轉回「星空圖」分頁。`);
                document.querySelector('.tab-link[data-tab="starmap"]').click();
                setTimeout(() => { starMapMessage.innerText = ''; }, 3000); // 3秒後清除訊息
            }, 300);
        }
    });
    
    // 3. 星空圖相關按鈕事件監聽
    locationButton.addEventListener('click', getLocation);
    zoomInButton.addEventListener('click', () => zoom(0.8));
    zoomOutButton.addEventListener('click', () => zoom(1.25));
    skyviewToggleButton.addEventListener('click', toggleSkyView);
    searchButton.addEventListener('click', findCelestialObject);
    clearButton.addEventListener('click', () => clearSearch(false));
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') findCelestialObject(); });


    // --- 星圖設定 ---
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
            show: true,
            stroke: "#3a8fb7",
            width: 1.5,
            cardinal: true,
            cardinalstyle: {
                fill: "#87CEEB",
                font: "bold 16px 'Helvetica', Arial, sans-serif",
                offset: 14
            }
        },
        stars: {
            show: true, limit: 6, colors: true,
            style: { fill: "#ffffff", opacity: 1 },
            names: true, proper: true, namelimit: 2.5,
            namestyle: { fill: "#ddddff", font: "13px 'Helvetica', Arial, sans-serif" }
        },
        planets: {
            show: true, symbolType: "disk"
        },
        constellations: {
            show: true, names: true,
            namestyle: { fill: "#87CEEB", font: "14px 'Lucida Sans Unicode', sans-serif" },
            lines: true,
            linestyle: { stroke: "#3a8fb7", width: 1, opacity: 0.8 }
        },
        mw: {
            show: true,
            style: { fill: "#ffffff", opacity: 0.15 }
        },
        callback: function(error) {
            if (error) {
                console.error("Celestial Error:", error);
                return;
            }
            loadCelestialDataForSearch();
            setTimeout(getLocation, 500);
        }
    };

    // --- 初始化星圖 ---
    Celestial.display(celestialConfig);

    // --- 所有功能函數 ---

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
                        // 自動切換回關閉狀態
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
    
    // 將 Modal 函數掛載到 window，讓 HTML onclick 可以呼叫
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
