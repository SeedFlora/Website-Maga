# Website-Maga

Website ini adalah static site murni: cukup `index.html`, `styles.css`, dan folder `assets`.
Tidak perlu build tool, Node.js, atau server khusus.

## Preview Lokal

Buka `index.html` langsung di browser.

## Deploy Gratis di GitHub Pages

1. Pastikan repository `https://github.com/SeedFlora/Website-Maga` sudah dibuat.
2. Jalankan perintah berikut dari folder ini:

```powershell
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SeedFlora/Website-Maga.git
git push -u origin main
```

Catatan: pakai `git add .`, bukan `git add README.md`, supaya `index.html`, `styles.css`, `script.js`, PDF, dan gambar ikut terupload.

3. Di GitHub, buka `Settings` -> `Pages`.
4. Pada `Build and deployment`, pilih `Deploy from a branch`.
5. Pilih branch `main` dan folder `/root`, lalu simpan.

GitHub akan memberi URL publik setelah proses deploy selesai.
