let books = [];

// Ambil data buku dari CSV saat halaman dimuat
fetch('book_dataset.csv')
  .then(response => response.text())
  .then(csvText => {
    books = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    }).data.map(b => ({
      Title: b.Title,
      Genre: b.Genre,
      Pages: parseInt(b.Pages),
      Rating: parseFloat(b.Rating),
      Language: b.Language
    }));
  })
  .catch(error => {
    console.error('Error loading CSV:', error);
    // Fallback ke sample data jika CSV tidak tersedia
    books = [
      { Title: "The Great Gatsby", Genre: "Fiction", Pages: 180, Rating: 4.0, Language: "English" },
      { Title: "To Kill a Mockingbird", Genre: "Fiction", Pages: 324, Rating: 4.3, Language: "English" },
      { Title: "1984", Genre: "Science Fiction", Pages: 328, Rating: 4.4, Language: "English" },
      { Title: "Pride and Prejudice", Genre: "Romance", Pages: 432, Rating: 4.2, Language: "English" },
      { Title: "The Catcher in the Rye", Genre: "Fiction", Pages: 234, Rating: 3.8, Language: "English" },
      { Title: "Harry Potter and the Sorcerer's Stone", Genre: "Fantasy", Pages: 309, Rating: 4.5, Language: "English" },
      { Title: "The Hobbit", Genre: "Fantasy", Pages: 310, Rating: 4.3, Language: "English" },
      { Title: "Dune", Genre: "Science Fiction", Pages: 688, Rating: 4.2, Language: "English" },
      { Title: "The Da Vinci Code", Genre: "Mystery", Pages: 454, Rating: 3.9, Language: "English" },
      { Title: "Atomic Habits", Genre: "Self-Help", Pages: 320, Rating: 4.4, Language: "English" }
    ];
  });

// Event listener untuk form
document.getElementById('recommendationForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Show loading
  document.getElementById('result').innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Menganalisis preferensi Anda...</p>
    </div>
  `;

  // Simulasi delay untuk efek loading
  setTimeout(() => {
    // Ambil nilai preferensi dari form
    const genre = document.getElementById('genre').value;
    const minPages = parseInt(document.getElementById('minPages').value);
    const maxPages = parseInt(document.getElementById('maxPages').value);
    const minRating = parseFloat(document.getElementById('rating').value);
    const language = document.getElementById('language').value;

    const preferred = { genre, minPages, maxPages, minRating, language };

    // Fungsi normalisasi
    function normalize(values, value) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      return max === min ? 100 : ((value - min) / (max - min)) * 100;
    }

    const pagesArr = books.map(b => b.Pages);
    const ratingArr = books.map(b => b.Rating);

    // Proses scoring dan filter sesuai preferensi
    const scoredBooks = books
      .filter(b =>
        b.Rating >= preferred.minRating &&
        b.Pages >= preferred.minPages &&
        b.Pages <= preferred.maxPages
      ) // filter minimal rating
      .map(b => {
        const genreScore = b.Genre.toLowerCase() === preferred.genre.toLowerCase() ? 100 : 0;
        const pagesScore = b.Pages <= preferred.maxPages 
          ? normalize(pagesArr.map(p => -p), -b.Pages) 
          : 0;
        const ratingScore = normalize(ratingArr, b.Rating);
        const languageScore = b.Language === preferred.language ? 100 : 0;

        const totalScore = 
          genreScore * 0.4 +
          pagesScore * 0.1 +
          ratingScore * 0.3 +
          languageScore * 0.2;

        return { ...b, totalScore };
      });

    // Ambil 10 rekomendasi teratas
    const topBooks = scoredBooks.sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);

    // Tampilkan hasil
    const resultDiv = document.getElementById('result');
    if (topBooks.length === 0) {
      resultDiv.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">😔</div>
          <h3>Tidak ada rekomendasi yang sesuai</h3>
          <p>Coba ubah kriteria pencarian Anda untuk mendapatkan hasil yang lebih baik.</p>
        </div>
      `;
    } else {
      resultDiv.innerHTML = topBooks.map((book, index) => `
        <div class="book-card">
          <div class="book-title">
            ${index + 1}. ${book.Title}
            <span class="rating-badge">⭐ ${book.Rating}</span>
          </div>
          <div class="book-details">
            <div class="book-detail">
              <strong>Genre:</strong> ${book.Genre}
            </div>
            <div class="book-detail">
              <strong>Halaman:</strong> ${book.Pages}
            </div>
            <div class="book-detail">
              <strong>Bahasa:</strong> ${book.Language}
            </div>
            <div class="book-detail">
              <strong>Score:</strong> ${book.totalScore.toFixed(1)}%
            </div>
          </div>
        </div>
      `).join('');
    }
  }, 1000); // Delay 1 detik untuk efek loading
});