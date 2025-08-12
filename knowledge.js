// knowledge.js
document.addEventListener("DOMContentLoaded", function() {

    // --- 滾動監聽與平滑滾動 ---
    const sideNavLinks = document.querySelectorAll('.side-nav a');
    const contentSections = document.querySelectorAll('.content-well section, .content-well footer');

    // 點擊連結，平滑滾動到對應區塊
    sideNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 滾動時，自動反白對應的導覽連結
    const onScroll = () => {
        let currentSection = "";
        contentSections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 100) { // 100px 的偏移量
                currentSection = section.getAttribute('id');
            }
        });

        sideNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSection)) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', onScroll);

    // --- 星座故事書互動卡片 ---
    const storybookGrid = document.getElementById('storybook-grid-main');
    const storyModal = document.getElementById('storyModal');

    if (storybookGrid && storyModal) {
        const stories = [
            { name: '獵戶座', id: 'orion', text: '獵戶座是夜空中最容易辨認的星座之一！他是一位勇猛的獵人，腰上繫著由三顆亮星組成的腰帶。' },
            { name: '大熊座', id: 'ursa_major', text: '大熊座裡包含了最有名的「北斗七星」。在神話中，這是一隻被天神放到天上的大熊。' },
            { name: '仙后座', id: 'cassiopeia', text: '仙后座看起來像一個英文字母 "W" 或 "M"。她是一位愛漂亮的皇后。' }
        ];

        stories.forEach(story => {
            const card = document.createElement('div');
            card.className = 'constellation-card';
            // 假設圖檔已命名為 orion.svg, ursa_major.svg 等
            const imgSrc = `/kidrise-starmap/images/${story.id}.svg`; 
            card.innerHTML = `<img src="${imgSrc}" alt="${story.name}"><h3>${story.name}</h3>`;
            card.addEventListener('click', () => showStoryModal(story.name, imgSrc, story.text));
            storybookGrid.appendChild(card);
        });

        const modalClose = storyModal.querySelector('.modal-close');
        function showStoryModal(title, imgSrc, text) {
            storyModal.querySelector("#modalTitle").innerText = title;
            storyModal.querySelector("#modalImage").src = imgSrc;
            storyModal.querySelector("#modalStory").innerText = text;
            storyModal.style.display = "flex";
        }
        function closeStoryModal() {
            storyModal.style.display = "none";
        }
        if(modalClose) modalClose.addEventListener('click', closeStoryModal);
        window.addEventListener("click", (evt) => {
            if (evt.target === storyModal) closeStoryModal();
        });
    }
});
