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
  });

// Saat form disubmit, ambil preferensi user dan proses rekomendasi
document.getElementById('recommendationForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Ambil nilai preferensi dari form
  const genre = document.getElementById('genre').value;
  const maxPages = parseInt(document.getElementById('pages').value);
  const minRating = parseFloat(document.getElementById('rating').value);
  const language = document.getElementById('language').value;

  const preferred = { genre, maxPages, minRating, language };

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
    .filter(b => b.Rating >= preferred.minRating) // filter minimal rating
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

  // Ambil 5 rekomendasi teratas
  const topBooks = scoredBooks.sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);

  // Tampilkan hasil ke halaman
  const resultDiv = document.getElementById('result');
  if (topBooks.length === 0) {
    resultDiv.innerHTML = '<p>Tidak ada rekomendasi buku yang sesuai.</p>';
  } else {
    resultDiv.innerHTML = `
      <h2>Rekomendasi Buku Teratas:</h2>
      <ol>
        ${topBooks.map(book => `
          <li>
            <strong>${book.Title}</strong><br>
            Genre: ${book.Genre}<br>
            Halaman: ${book.Pages}<br>
            Rating: ${book.Rating}<br>
            Bahasa: ${book.Language}
          </li>
        `).join('')}
      </ol>
    `;
  }
});