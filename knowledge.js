// knowledge.js
document.addEventListener("DOMContentLoaded", function() {
    const storybookGrid = document.getElementById('storybook-grid');
    const storyModal = document.getElementById('storyModal');
    const modalClose = document.getElementById('modal-close');

    const stories = [
        { name: '獵戶座', img: 'orion.svg', text: '獵戶座是夜空中最容易辨認的星座之一！他是一位勇猛的獵人，腰上繫著由三顆亮星組成的腰帶。' },
        { name: '大熊座', img: 'ursamajor.svg', text: '大熊座裡包含了最有名的「北斗七星」。在神話中，這是一隻被天神放到天上的大熊。' },
        { name: '仙后座', img: 'cassiopeia.svg', text: '仙后座看起來像一個英文字母 "W" 或 "M"。她是一位愛漂亮的皇后。' }
    ];

    // 動態生成星座卡片
    stories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'constellation-card';
        card.innerHTML = `
            <img src="/kidrise-starmap/images/${story.img}" alt="${story.name}">
            <h3>${story.name}</h3>
        `;
        card.addEventListener('click', () => showStoryModal(story.name, `/kidrise-starmap/images/${story.img}`, story.text));
        storybookGrid.appendChild(card);
    });

    // Modal 相關功能
    function showStoryModal(title, imgSrc, text) {
        if (!storyModal) return;
        storyModal.querySelector("#modalTitle").innerText = title;
        storyModal.querySelector("#modalImage").src = imgSrc;
        storyModal.querySelector("#modalStory").innerText = text;
        storyModal.style.display = "flex";
    }

    function closeStoryModal() {
        if (storyModal) storyModal.style.display = "none";
    }

    modalClose.addEventListener('click', closeStoryModal);
    window.addEventListener("click", (evt) => {
        if (evt.target === storyModal) closeStoryModal();
    });
});
