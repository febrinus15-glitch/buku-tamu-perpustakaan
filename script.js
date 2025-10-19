// Inisialisasi data feedback
let feedbacks = JSON.parse(localStorage.getItem('libraryFeedbacks')) || [];
let currentFilter = 'all';

// Element DOM
const feedbackForm = document.getElementById('feedbackForm');
const feedbackContainer = document.getElementById('feedbackContainer');
const ratingFilter = document.getElementById('ratingFilter');
const darkModeToggle = document.getElementById('darkModeToggle');
const exportBtn = document.getElementById('exportBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const feedbackCount = document.getElementById('feedbackCount');
const totalFeedback = document.getElementById('totalFeedback');
const averageRating = document.getElementById('averageRating');
const todayFeedback = document.getElementById('todayFeedback');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkDarkMode();
    displayFeedbacks();
    updateStats();
});

// Dark Mode Functionality
function checkDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️ Light Mode';
    }
}

darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode.toString());
    darkModeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Filter Functionality
ratingFilter.addEventListener('change', function() {
    currentFilter = this.value;
    displayFeedbacks();
});

// Export Functionality
exportBtn.addEventListener('click', function() {
    if (feedbacks.length === 0) {
        alert('Tidak ada data untuk di-export!');
        return;
    }
    
    let csv = 'Nama,Pesan,Rating,Tanggal\n';
    feedbacks.forEach(feedback => {
        csv += `"${feedback.name}","${feedback.message}",${feedback.rating},"${feedback.date}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'feedback_perpustakaan.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Clear All Functionality
clearAllBtn.addEventListener('click', function() {
    if (feedbacks.length === 0) {
        alert('Tidak ada data untuk dihapus!');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus semua feedback?')) {
        feedbacks = [];
        localStorage.setItem('libraryFeedbacks', JSON.stringify(feedbacks));
        displayFeedbacks();
        updateStats();
        alert('Semua feedback telah dihapus!');
    }
});

// Form Submit Event
feedbackForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;
    const rating = document.getElementById('rating').value;
    
    // Validasi sederhana
    if (name.trim() === '' || message.trim() === '') {
        alert('Harap isi nama dan pesan!');
        return;
    }
    
    // Buat feedback object
    const feedback = {
        id: Date.now(),
        name: name,
        message: message,
        rating: parseInt(rating),
        date: new Date().toLocaleString('id-ID')
    };
    
    // Simpan ke array dan localStorage
    feedbacks.unshift(feedback); // Add to beginning for newest first
    localStorage.setItem('libraryFeedbacks', JSON.stringify(feedbacks));
    
    // Reset form dan update tampilan
    feedbackForm.reset();
    displayFeedbacks();
    updateStats();
    
    alert('Terima kasih atas feedbacknya! 📖');
});

// Delete Single Feedback
function deleteFeedback(id) {
    if (confirm('Hapus feedback ini?')) {
        feedbacks = feedbacks.filter(feedback => feedback.id !== id);
        localStorage.setItem('libraryFeedbacks', JSON.stringify(feedbacks));
        displayFeedbacks();
        updateStats();
    }
}

// Display Feedbacks with Filter
function displayFeedbacks() {
    const filteredFeedbacks = currentFilter === 'all' 
        ? feedbacks 
        : feedbacks.filter(feedback => feedback.rating === parseInt(currentFilter));
    
    feedbackCount.textContent = filteredFeedbacks.length;
    
    if (filteredFeedbacks.length === 0) {
        feedbackContainer.innerHTML = `
            <div class="empty-state">
                <h3>📝 Tidak ada feedback</h3>
                <p>${currentFilter === 'all' ? 'Jadilah yang pertama memberikan feedback!' : 'Tidak ada feedback dengan rating ini'}</p>
            </div>
        `;
        return;
    }
    
    feedbackContainer.innerHTML = filteredFeedbacks.map(feedback => `
        <div class="feedback-item">
            <button class="delete-btn" onclick="deleteFeedback(${feedback.id})">Hapus</button>
            <h3>${feedback.name}</h3>
            <div class="rating">${'⭐'.repeat(feedback.rating)}</div>
            <p>${feedback.message}</p>
            <div class="date">${feedback.date}</div>
        </div>
    `).join('');
}

// Update Statistics
function updateStats() {
    // Total Feedback
    totalFeedback.textContent = feedbacks.length;
    
    // Average Rating
    if (feedbacks.length > 0) {
        const average = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length;
        averageRating.textContent = average.toFixed(1);
    } else {
        averageRating.textContent = '0';
    }
    
    // Today's Feedback
    const today = new Date().toLocaleDateString('id-ID');
    const todayCount = feedbacks.filter(feedback => {
        const feedbackDate = new Date(feedback.id).toLocaleDateString('id-ID');
        return feedbackDate === today;
    }).length;
    todayFeedback.textContent = todayCount;
}