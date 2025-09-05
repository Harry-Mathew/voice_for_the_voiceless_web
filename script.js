document.addEventListener('DOMContentLoaded', () => {
    const dogImages = [
        'https://pbs.twimg.com/media/GwUczcnX0AAPxfd.jpg',
        'https://pbs.twimg.com/media/GzIMPS7aIAEH08a.jpg',
        'https://pbs.twimg.com/media/GzGZZXIbEAA412V.jpg',
        'https://pbs.twimg.com/media/Gy0FQF2XUAAGEbd.jpg',
        'https://pbs.twimg.com/media/Gy0FSfKWUAAF-8W.jpg',
        'https://pbs.twimg.com/media/Gy0FVhdX0AAmo5w.jpg',
        'https://pbs.twimg.com/media/Gy1gSoPXUAEJoQE.jpg',
        'https://pbs.twimg.com/media/Gysa7GxacAAbv41.jpg',
        'https://pbs.twimg.com/media/Gy6hvcJWsAA5W9t.jpg',
        'https://pbs.twimg.com/media/GvlCJkKX0AAs7Jx.jpg',
        'https://pbs.twimg.com/media/GvlCJ77XYAAaTgt.jpg',
        'https://pbs.twimg.com/media/GvlCKmBXIAA2Bpg.jpg',
        'https://pbs.twimg.com/media/GvlCKrRXUAEEbqB.jpg',
        'https://pbs.twimg.com/media/GxrJbhXawAYo1yq.jpg',
        'https://pbs.twimg.com/media/GzPAggKXkAAs0hc.jpg',
        'https://pbs.twimg.com/media/GzUXkeLWsAAQ6TQ.jpg',
        'https://pbs.twimg.com/media/GvplJo3WEAA9eXR.png',
        'https://pbs.twimg.com/media/GsaT69ibIAAXQgw.jpg',
        'https://pbs.twimg.com/media/Gw8a78qWMAAek_o.png',
        'https://pbs.twimg.com/media/Gttu4AbW0AA0g95.jpg',
        'https://pbs.twimg.com/media/GzkwB15WcAA6SAb.jpg',
        'https://pbs.twimg.com/media/GyHjhN0XkAAHgKD.jpg',
        'https://pbs.twimg.com/media/GivRTUgXAAAWyAz.jpg',
        'https://pbs.twimg.com/media/GvGGI8tXcAAYeQz.jpg',
        'https://pbs.twimg.com/media/GuJAlz3XwAAwU3X.jpg',
    ];

    const gallery = document.querySelector('.gallery');
    dogImages.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Cute dog';
        img.loading = 'lazy';
        gallery.appendChild(img);
    });

    const homeSection = document.getElementById('home');
    const reportSection = document.getElementById('report');
    const reportBtn = document.getElementById('report-btn');
    const backBtn = document.getElementById('back-btn');
    const reportForm = document.getElementById('report-form');
    const photoInput = document.getElementById('photo');
    const previewDiv = document.getElementById('photo-preview');
    const previewImg = document.getElementById('preview-img');

    reportBtn.addEventListener('click', () => {
        homeSection.classList.add('hidden');
        reportSection.classList.remove('hidden');
    });

    backBtn.addEventListener('click', () => {
        reportSection.classList.add('hidden');
        homeSection.classList.remove('hidden');
        reportForm.reset();
        previewDiv.classList.add('hidden');
    });

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                previewDiv.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('location').value && document.getElementById('description').value && photoInput.files.length > 0) {
            alert('Report submitted successfully! Thank you for helping.');
            reportForm.reset();
            previewDiv.classList.add('hidden');
            reportSection.classList.add('hidden');
            homeSection.classList.remove('hidden');
        } else {
            alert('Please fill all fields and select a photo.');
        }
    });
});