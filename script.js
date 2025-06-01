// Data buku (dummy)
const books = [
  { title: "Buku A", genre: "fiksi", rating: 4.5, pages: 300 },
  { title: "Buku B", genre: "sains", rating: 4.0, pages: 250 },
  { title: "Buku C", genre: "nonfiksi", rating: 3.8, pages: 400 },
  { title: "Buku D", genre: "fiksi", rating: 4.9, pages: 150 },
  { title: "Buku E", genre: "sains", rating: 4.2, pages: 280 },
  { title: "Buku F", genre: "nonfiksi", rating: 4.7, pages: 320 },
];

// Bobot tiap kriteria
const weights = {
  genre: 0.3,
  rating: 0.5,
  pages: 0.2
};

document.getElementById("recommendationForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const userGenre = document.getElementById("genre").value;
  const minRating = parseFloat(document.getElementById("rating").value);
  const maxPages = parseInt(document.getElementById("pages").value);

  // Normalisasi dan hitung skor
  const maxRating = Math.max(...books.map(b => b.rating));
  const maxPage = Math.max(...books.map(b => b.pages));

  const scoredBooks = books.map(b => {
    // Genre cocok = 1, tidak cocok = 0
    const genreScore = (b.genre === userGenre) ? 1 : 0;

    // Rating dinormalisasi
    const ratingScore = b.rating / maxRating;

    // Semakin sedikit halaman dibandingkan preferensi user, semakin baik
    const pageScore = 1 - (Math.abs(b.pages - maxPages) / maxPage);

    // Skor total (SAW)
    const totalScore = 
      (genreScore * weights.genre) +
      (ratingScore * weights.rating) +
      (pageScore * weights.pages);

    return { ...b, totalScore };
  });

  // Ambil 5 skor tertinggi
  const topBooks = scoredBooks
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<h3>Rekomendasi Buku Terbaik:</h3><ol>" +
    topBooks.map(b => `<li>${b.title} (Skor: ${b.totalScore.toFixed(2)})</li>`).join("") +
    "</ol>";
});
