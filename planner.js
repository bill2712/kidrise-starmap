// planner.js
document.addEventListener("DOMContentLoaded", function() {
    const observatorySelect = document.getElementById('observatory-select');

    const observatories = {
        "T11,US": { name: "New Mexico, USA", location: [32.90, -105.53] },
        "T32,AU": { name: "Siding Spring, Australia", location: [-31.27, 149.06] },
        "T7,ES": { name: "Siding Spring, Spain", location: [38.43, -2.54] }
    };

    observatorySelect.addEventListener('change', () => {
        const selectedValue = observatorySelect.value;
        if (!selectedValue) return;

        const obs = observatories[selectedValue];

        // 使用 localStorage 在頁面間傳遞資料
        localStorage.setItem('plannerLocation', JSON.stringify(obs));
        
        // 跳轉回主頁
        window.location.href = '/kidrise-starmap/index.html';
    });
});
