// 使用 DOMContentLoaded 確保頁面元素都載入完成後再執行腳本
document.addEventListener("DOMContentLoaded", function() {

    // --- 全域變數定義 ---
    const messageElement = document.getElementById('message');
    const locationButton = document.getElementById('locationButton');
    const storyModal = document.getElementById('storyModal');

    // ==========================================
    //  功能一：即時星空圖的腳本
    // ==========================================

    // 星圖的詳細設定
    const celestialConfig = {
        width: 0, 
        projection: "stereographic",
        transform: "equatorial",
        background: { fill: "#000", stroke: "#000" },
        // 注意：路徑已改為您本地的 data 資料夾
        datapath: "data/",
        stars: {
            show: true, limit: 6, colors: true,
            style: { fill: "#ffffff", opacity: 1 },
            names: true, proper: true, namelimit: 2.5,
            namestyle: { fill: "#ddddff", font: "13px 'Helvetica', Arial, sans-serif" }
        },
        planets: {
            show: true, symbolType: "disk",
            symbols: {
              "sol": {symbol: "☉", fill: "#ffcc00"}, "lun": {symbol: "☽", fill: "#f0f0f0"},
              "mer": {symbol: "☿", fill: "#a9a9a9"}, "ven": {symbol: "♀", fill: "#f0e68c"},
              "mar": {symbol: "♂", fill: "#ff4500"}, "jup": {symbol: "♃", fill: "#c2b280"},
              "sat": {symbol: "♄", fill: "#f5deb3"}, "ura": {symbol: "♅", fill: "#afeeee"},
              "nep": {symbol: "♆", fill: "#4169e1"}
            }
        },
        constellations: {
            show: true, names: true, desig: true,
            namestyle: { fill: "#87CEEB", font: "14px 'Lucida Sans Unicode', sans-serif" },
            lines: true,
            linestyle: { stroke: "#3a8fb7", width: 1, opacity: 0.8 }
        },
        mw: {
            show: true,
            style: { fill: "#ffffff", opacity: 0.15 }
        }
    };

    // 初始化星圖
    Celestial.display(celestialConfig);

    // 為定位按鈕新增點擊事件
    locationButton.addEventListener('click', getLocation);

    function getLocation() {
        if (navigator.geolocation) {
            messageElement.innerText = "正在取得您的位置...";
            navigator.geolocation.getCurrentPosition(showPosition, showError, {timeout: 10000});
        } else {
            messageElement.innerText = "您的瀏覽器不支援定位功能。";
        }
    }

    function showPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        messageElement.innerText = `已更新為您的位置！`;
        Celestial.display({ location: [lat, lon], local: true });
        setTimeout(() => { messageElement.innerText = ''; }, 3000);
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                messageElement.innerText = "您已拒絕位置請求。";
                break;
            case error.POSITION_UNAVAILABLE:
                messageElement.innerText = "無法獲取當前位置。";
                break;
            case error.TIMEOUT:
                messageElement.innerText = "獲取位置超時。";
                break;
            default:
                messageElement.innerText = "獲取位置時發生未知錯誤。";
                break;
        }
    }

    // ==========================================
    //  功能二：星座故事書的腳本
    // ==========================================

    // 將函數掛載到 window 物件上，這樣 HTML 中的 onclick 才能找到它們
    window.showStoryModal = function(title, imageSrc, story) {
        document.getElementById('modalTitle').innerText = title;
        document.getElementById('modalImage').src = imageSrc;
        document.getElementById('modalStory').innerText = story;
        if (storyModal) storyModal.style.display = 'flex';
    }

    window.closeStoryModal = function() {
        if (storyModal) storyModal.style.display = 'none';
    }

    // 點擊視窗外部區域也可關閉
    window.onclick = function(event) {
        if (event.target == storyModal) {
            closeStoryModal();
        }
    }

}); // DOMContentLoaded 結束