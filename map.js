// map.js
document.addEventListener("DOMContentLoaded", function() {

    if (typeof Celestial === "undefined") {
        console.error("核心星圖函式庫 Celestial 未能成功載入。");
        document.getElementById("starmap-container").innerHTML = "<h1>星圖載入失敗</h1>";
        return;
    }

    const ui = {
        messageElement: document.getElementById('message'),
        locationButton: document.getElementById('locationButton'),
        skyviewToggleButton: document.getElementById('skyview-toggle'),
        toggleArtButton: document.getElementById('toggle-art-button'),
        zoomInButton: document.getElementById('zoom-in'),
        zoomOutButton: document.getElementById('zoom-out'),
    };

    let state = {
        isSkyviewActive: false,
        isArtActive: false,
        orientationLastUpdate: 0
    };

    function showMessage(message, duration = 2000) {
        ui.messageElement.innerText = message;
        if (duration > 0) {
            setTimeout(() => { ui.messageElement.innerText = ''; }, duration);
        }
    }

    const constellationArtConfig = {
        images: true, imageStyle: { width: 0.8, opacity: 0.4 },
        imageList: [ {c:"ori", f:"/kidrise-starmap/images/constellations/ori.png"}, {c:"uma", f:"/kidrise-starmap/images/constellations/uma.png"}, {c:"cas", f:"/kidrise-starmap/images/constellations/cas.png"}, {c:"sco", f:"/kidrise-starmap/images/constellations/sco.png"} ]
    };

    const celestialConfig = {
        // ... (省略與之前版本相同的詳細設定)
        width: 0, projection: "stereographic", transform: "equatorial", background: { fill: "#000", stroke: "#000" }, datapath: "/kidrise-starmap/data/", interactive: true, zoombuttons: false, controls: true,
        horizon: { show: true, stroke: "#3a8fb7", width: 1.5, cardinal: true, cardinalstyle: { fill: "#87CEEB", font: "bold 16px 'Helvetica', Arial, sans-serif", offset: 14 } },
        stars: { show: true, limit: 6, colors: true, style: { fill: "#ffffff", opacity: 1, width: 1.5 }, names: true, proper: true, namelimit: 2.5, namestyle: { fill: "#ddddff", font: "14px 'Helvetica', Arial, sans-serif" } },
        planets: { show: true, which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"], symbolType: "disk", symbols: { "sol": {symbol: "☉", fill: "#ffcc00"}, "lun": {symbol: "☽", fill: "#f0f0f0"}, "mer": {symbol: "☿", fill: "#a9a9a9"}, "ven": {symbol: "♀", fill: "#f0e68c"}, "mar": {symbol: "♂", fill: "#ff4500"}, "jup": {symbol: "♃", fill: "#c2b280"}, "sat": {symbol: "♄", fill: "#f5deb3"}, "ura": {symbol: "♅", fill: "#afeeee"}, "nep": {symbol: "♆", fill: "#4169e1"}, "ter": {symbol: "♁", fill: "#0077be"} }, style: { width: 2 }, namestyle: { fill: "#f0f0f0", font: "14px 'Helvetica', Arial, sans-serif", align: "center", baseline: "middle" } },
        constellations: { show: true, names: true, namestyle: { fill: "#87CEEB", font: "16px 'Lucida Sans Unicode', sans-serif" }, lines: true, linestyle: { stroke: "#5594b8", width: 1.5, opacity: 0.8 }, images: false },
        mw: { show: true, style: { fill: "#ffffff", opacity: 0.15 } },
        // Callback 在地圖準備好後執行
        callback: function (err) {
            if (err) return console.error("Celestial Error:", err);
            
            // 檢查是否有從 planner.html 傳來的地點
            const savedLocation = localStorage.getItem('plannerLocation');
            if (savedLocation) {
                const loc = JSON.parse(savedLocation);
                showMessage(`正在顯示 ${loc.name} 的星空...`, 3000);
                Celestial.apply({ location: loc.location, local: true });
                localStorage.removeItem('plannerLocation'); // 用完即刪
            } else {
                // 如果沒有，則獲取使用者當前位置
                setTimeout(getLocation, 500);
            }
        }
    };

    // --- 初始化 ---
    Celestial.display(celestialConfig);

    // --- 事件監聽 ---
    ui.locationButton.addEventListener('click', getLocation);
    ui.zoomInButton.addEventListener('click', () => zoomBy(0.8));
    ui.zoomOutButton.addEventListener('click', () => zoomBy(1.25));
    ui.skyviewToggleButton.addEventListener('click', toggleSkyView);
    ui.toggleArtButton.addEventListener('click', toggleConstellationArt);
    
    // --- 功能函式 ---
    function zoomBy(factor) { /* ... (與之前版本相同) ... */ }
    function toggleConstellationArt() { /* ... (與之前版本相同) ... */ }
    function toggleSkyView() { /* ... (與之前版本相同) ... */ }
    function orientationHandler(evt) { /* ... (與之前版本相同) ... */ }
    function getLocation() { /* ... (與之前版本相同) ... */ }
    function showPosition(position) { /* ... (與之前版本相同) ... */ }
    function showError(error) { /* ... (與之前版本相同) ... */ }

    // 此處應貼上 zoomBy, toggle... 等函式的完整定義
});
