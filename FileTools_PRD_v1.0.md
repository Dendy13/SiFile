# FileTools — Product Requirements Document

**Version:** 1.0.0
**Status:** Draft — In Review
**Last Updated:** May 2026
**Deployment:** Google Cloud Run + Firebase

---

## Daftar Isi

1. [Product Overview](#1-product-overview)
2. [Fitur & Fungsionalitas](#2-fitur--fungsionalitas)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Arsitektur Freemium (Pre-implemented, Disabled)](#4-arsitektur-freemium-pre-implemented-disabled)
5. [Agentic Processing Layer](#5-agentic-processing-layer)
6. [Deployment Architecture](#6-deployment-architecture-google-ecosystem)
7. [Keamanan & Privasi](#7-keamanan--privasi)
8. [UI/UX Design Guidelines](#8-uiux-design-guidelines)
9. [Metrics & Success Criteria](#9-metrics--success-criteria)
10. [Roadmap & Timeline](#10-roadmap--timeline)
- [Appendix A: Firestore Data Model](#appendix-a-firestore-data-model)
- [Appendix B: API Endpoints](#appendix-b-api-endpoints)

---

## 1. Product Overview

FileTools adalah utilitas file berbasis web yang dibangun dengan pendekatan **Agentic** — setiap operasi dieksekusi oleh AI pipeline yang memahami konteks file, bukan sekadar wrapper tool CLI. Platform ini menyediakan operasi PDF dan gambar berkualitas tinggi dengan UX yang bersih, cepat, dan dapat diandalkan.

Produk diluncurkan dalam mode **fully free** (freemium dinonaktifkan), dengan infrastruktur siap untuk mengaktifkan pembatasan usage dan tier berbayar kapan saja tanpa refactor besar.

### 1.1 Visi & Tujuan

- Menjadi utilitas file all-in-one terbaik dengan kualitas hasil tertinggi di kelasnya
- Arsitektur agentic memungkinkan pemrosesan cerdas yang menyesuaikan parameter secara otomatis
- Freemium-ready sejak hari pertama, dapat diaktifkan dengan feature flag tanpa perubahan kode besar
- Deployment zero-downtime via Google Cloud Run dengan autoscaling

### 1.2 Target Pengguna

| Segmen | Prioritas | Use Case Utama |
|---|---|---|
| Pekerja kantoran & freelancer | Primary | Compress & merge PDF untuk email, laporan |
| Developer & desainer | Primary | Konversi format, resize batch image |
| Pelajar & mahasiswa | Secondary | Split PDF diktat, compress file tugas |
| Small business | Secondary | Watermark invoice, merge kontrak |

---

## 2. Fitur & Fungsionalitas

### 2.1 PDF Tools

| Fitur | Deskripsi | Parameter Agentic | Priority |
|---|---|---|---|
| Compress PDF | Kurangi ukuran file PDF mempertahankan kualitas visual optimal | Auto-detect konten (teks vs gambar), pilih strategi kompresi adaptif | P0 |
| Merge PDF | Gabungkan beberapa PDF menjadi satu dokumen dengan urutan drag-drop | Deteksi orientasi halaman, normalisasi ukuran halaman otomatis | P0 |
| Split PDF | Pisahkan PDF berdasarkan halaman, range, atau bookmark | Deteksi chapter/section otomatis sebagai saran split point | P0 |
| PDF to JPG/PNG | Konversi setiap halaman PDF menjadi gambar beresolusi tinggi | Pilih DPI optimal berdasarkan konten (72/150/300 DPI) | P0 |
| JPG/PNG to PDF | Buat PDF dari satu atau banyak gambar dengan layout otomatis | Fit-to-page cerdas, pertahankan aspect ratio, pilih orientasi | P0 |
| Rotate PDF | Putar halaman PDF (90/180/270 derajat), satu atau semua halaman | Deteksi orientasi salah secara otomatis, sarankan koreksi | P1 |
| Add Watermark | Tambah watermark teks atau gambar ke PDF | Penempatan adaptif agar tidak menutupi konten penting | P1 |
| PDF to Word | Konversi PDF ke format DOCX yang dapat diedit | Pertahankan layout, tabel, dan format teks semaksimal mungkin | P2 |
| Extract Pages | Ekstrak halaman tertentu dari PDF menjadi file baru | Preview thumbnail per halaman untuk seleksi visual | P1 |
| Protect PDF | Tambah password dan enkripsi ke dokumen PDF | Sarankan strength password, konfirmasi sebelum enkripsi | P2 |

### 2.2 Image Tools

| Fitur | Deskripsi | Parameter Agentic | Priority |
|---|---|---|---|
| Compress PNG/JPG | Kurangi ukuran file gambar dengan kualitas optimal | Perbandingan sebelum/sesudah real-time, slider kualitas cerdas | P0 |
| Resize Image | Ubah dimensi gambar dengan berbagai mode resize | Preset ukuran populer, pertahankan aspect ratio otomatis | P0 |
| Convert Format | Konversi antara JPG, PNG, WebP, AVIF, GIF, BMP, TIFF | Pilih format output optimal berdasarkan konten dan tujuan | P0 |
| Crop Image | Potong gambar dengan rasio preset atau custom | Deteksi crop point terbaik berbasis subject detection | P1 |
| Remove Background | Hapus background gambar secara otomatis (AI-powered) | Fine-tune edge detection, pilih output transparan atau warna solid | P1 |
| Add Watermark | Tambah watermark teks atau logo ke gambar | Penempatan cerdas di area dengan kontras tinggi | P1 |
| Rotate & Flip | Putar dan balik gambar dengan berbagai opsi | Auto-detect orientasi EXIF dan koreksi otomatis | P1 |
| Batch Process | Proses banyak file sekaligus dengan pengaturan sama | Progress tracking per file, download sebagai ZIP | P2 |

### 2.3 Roadmap Fitur Mendatang (P3+)

- **OCR** — Ekstrak teks dari PDF scan & gambar
- **Video to GIF** — Konversi klip video pendek ke animasi GIF
- **Image Upscale** — Tingkatkan resolusi gambar dengan AI
- **E-Signature** — Tambah tanda tangan digital ke PDF
- **Document Scanner** — Perbaiki foto dokumen menjadi scan bersih

---

## 3. Arsitektur Sistem

### 3.1 Stack Teknologi

| Layer | Teknologi | Justifikasi |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR/SSG optimal, file upload UX, Vercel/Cloud Run compatible |
| Styling | Tailwind CSS + Design System custom | Sesuai design system Minimalist Modern yang telah didefinisikan |
| Backend / API | Next.js API Routes + tRPC | Type-safe end-to-end, mudah di-deploy ke Cloud Run |
| Agentic Layer | Anthropic Claude API (claude-sonnet-4) | Pemrosesan parameter cerdas, adaptif, dan kontekstual |
| File Processing | pdf-lib, sharp, imagemagick (via child_process) | Battle-tested libraries untuk manipulasi file berkualitas tinggi |
| Auth | Firebase Authentication | Google SSO, email/password, anonymous session, SDK matang |
| Database | Firebase Firestore | Real-time, serverless, pricing per-operasi cocok untuk SaaS |
| Storage | Firebase Storage (temp files) | Integrasi native dengan auth, auto-delete rules, CDN built-in |
| Session | Redis (Upstash) + Firebase session tokens | Rate limiting, session state, cache hasil operasi |
| Deployment | Google Cloud Run | Autoscaling ke zero, container-based, pay-per-use |
| CI/CD | Cloud Build + GitHub Actions | Trigger otomatis pada push, preview deployments |
| Monitoring | Google Cloud Logging + Monitoring | Error tracking, latency metrics, usage analytics |

### 3.2 Arsitektur High-Level

```
[ User Browser ]
       │ HTTPS
       ▼
[ Next.js Frontend — Cloud Run ]
  App Router · SSR/SSG · File Upload Handler · SSE Progress Stream
       │ tRPC
       ▼
[ API Routes + Middleware ]        [ Agentic Layer — Claude API ]
  Auth validation                   Analisis metadata file
  Rate limiting (Redis)   ◄────►    Parameter suggestion
  Usage tracking                    Quality check hasil
  Feature flags check               claude-sonnet-4
       │
       ▼
[ PDF Workers ]    [ Image Workers ]    [ Job Queue — Redis ]
  pdf-lib            sharp               Rate limiting
  ghostscript        imagemagick         Progress state
  compress/merge     compress/resize
       │
       ▼
[ Firebase Auth ]  [ Firestore + Storage ]  [ Cloud Run + Build ]
  Google SSO         User profiles           Autoscale 0→20
  Anonymous          Usage tracking          asia-southeast1
  Email/Pass         Temp files 24h TTL      CI/CD pipeline
```

### 3.3 Auth & Session Management

| Mode | Deskripsi | Capabilities | Data Persistence |
|---|---|---|---|
| Anonymous Session | User belum login, cookie session 24 jam | Semua fitur (saat freemium nonaktif) | Tidak ada, file dihapus setelah proses |
| Authenticated Free | Login via Google/Email | Semua fitur, riwayat 30 hari, limit file lebih besar | Firestore per user |
| Authenticated Pro | Berlangganan aktif (disabled by flag) | Fitur premium, unlimited, prioritas queue | Firestore + extended history |

**Flow Autentikasi:**

1. User akses → Cek Firebase session token di cookie
2. Jika tidak ada → Buat anonymous session (Firestore doc dengan TTL 24 jam)
3. Login trigger → Merge anonymous usage history ke akun permanen
4. Setiap request API → Middleware validasi token, inject user context ke handler
5. Token refresh → Dilakukan otomatis oleh Firebase SDK setiap jam

### 3.4 Usage Tracking

Usage tracking diimplementasikan sejak hari pertama, namun enforcement (pembatasan) dinonaktifkan melalui feature flag `FREEMIUM_ENABLED=false`.

| Event | Kapan Ditrack | Data Disimpan | Digunakan Untuk |
|---|---|---|---|
| `file_upload` | Setiap file diupload | user_id, file_type, file_size, timestamp | Analytics, abuse detection |
| `operation_start` | Mulai setiap operasi | user_id, operation_type, file_size, params | Billing basis, rate limiting |
| `operation_complete` | Operasi selesai sukses | duration_ms, output_size, cost_estimate | Performance monitoring |
| `operation_error` | Operasi gagal | error_code, error_message, retry_count | Error tracking, debugging |
| `download` | User download hasil | user_id, operation_id, timestamp | Feature usage analytics |

**Struktur Data Firestore — `users/{uid}/usage/{month}`:**

```json
{
  "pdf_compress": 12,
  "pdf_merge": 3,
  "img_resize": 8,
  "total_mb_processed": 245.6,
  "operations_count": 23,
  "last_active": "timestamp"
}
```

---

## 4. Arsitektur Freemium (Pre-implemented, Disabled)

Seluruh infrastruktur freemium dibangun sejak awal namun dikontrol oleh feature flag. Pendekatan ini memungkinkan aktivasi kapan saja tanpa refactoring.

### 4.1 Feature Flag System

| Flag | Default Value | Efek Ketika `true` |
|---|---|---|
| `FREEMIUM_ENABLED` | `false` | Aktifkan semua pembatasan tier free vs pro |
| `REQUIRE_AUTH` | `false` | Wajibkan login untuk semua operasi |
| `SHOW_UPGRADE_CTA` | `false` | Tampilkan prompt upgrade ketika limit tercapai |
| `PAYMENT_ENABLED` | `false` | Aktifkan Stripe checkout dan subscription management |

### 4.2 Rencana Tier (Siap Diaktifkan)

| Batasan | Free Tier | Pro Tier |
|---|---|---|
| Operasi per hari | 10 operasi | Unlimited |
| Ukuran file maksimum | 20 MB per file | 200 MB per file |
| Batch processing | Tidak tersedia | Hingga 50 file sekaligus |
| Riwayat file | Tidak disimpan | 30 hari riwayat download |
| Remove background | Tidak tersedia | Tersedia |
| PDF to Word | Tidak tersedia | Tersedia |
| Prioritas queue | Standard (shared) | Priority queue |
| Harga (rencana) | Rp 0 / bulan | Rp 49.000 / bulan |

### 4.3 Implementasi Rate Limiting

Rate limiting menggunakan Redis (Upstash) dengan sliding window algorithm.

- **Key format:** `ratelimit:{user_id}:{operation_type}:{date}`
- Anonymous user: rate limit berdasarkan IP + session ID
- Authenticated free: rate limit berdasarkan user_id
- Pro user: tidak ada rate limit (bypass flag)
- Ketika `FREEMIUM_ENABLED=false`: semua request melewati rate limiter dengan quota tak terbatas

---

## 5. Agentic Processing Layer

Setiap operasi file diproses melalui pipeline agentic yang menggunakan Claude API untuk menentukan parameter optimal sebelum eksekusi.

### 5.1 Pipeline Agentic

```
1. File Analysis      → Analisis metadata (ukuran, format, jenis konten)
2. Parameter Suggest  → Claude API tentukan setting optimal
3. User Confirmation  → Tampilkan saran, user bisa override
4. Processing         → Eksekusi dengan parameter final, progress via SSE
5. Quality Check      → Verifikasi hasil (ukuran, integritas, quality score)
6. Delivery           → Upload ke Firebase Storage, generate signed URL
```

### 5.2 Contoh Agentic Parameter Decision

| Operasi | Input Analisis | Output Parameter Otomatis |
|---|---|---|
| Compress PDF | PDF berisi banyak foto high-res (>5MB) | Kompresi gambar 72%, downscale >2400px, pertahankan font vektor |
| Compress PDF | PDF berisi teks dan tabel (business report) | Kompresi minimal, fokus metadata stripping, pertahankan kualitas font |
| Compress Image | PNG screenshot UI (flat color) | Convert ke PNG-8 atau WebP lossless, kurangi color depth |
| Compress Image | JPG foto produk e-commerce | JPEG quality 82%, progressive encoding, strip EXIF data |
| Resize Image | 1600×1200 foto untuk Instagram | Auto-suggest 1080×1080 crop center atau 1080×810 letterbox |

---

## 6. Deployment Architecture (Google Ecosystem)

### 6.1 Cloud Run Configuration

| Parameter | Nilai | Keterangan |
|---|---|---|
| Min instances | 0 | Scale to zero saat tidak ada traffic (cost saving) |
| Max instances | 20 | Autoscale berdasarkan concurrent requests |
| CPU | 2 vCPU | Cukup untuk file processing intensif |
| Memory | 2 GB | Buffer untuk file besar di memory saat processing |
| Request timeout | 300 detik | Untuk file besar, operasi complex (PDF to Word, dll) |
| Concurrency | 10 req/instance | Batasi agar processing tidak saling bersaing memory |
| Region | asia-southeast1 | Singapore, latency optimal untuk user Indonesia |

### 6.2 Firebase Services

| Service | Konfigurasi | Catatan |
|---|---|---|
| Authentication | Google SSO, Email/Password, Anonymous | Rate limit sign-in via Firebase App Check |
| Firestore | Multi-region asia, rules berbasis auth | Struktur: users, operations, usage_stats |
| Storage | Bucket regional asia-southeast1 | Lifecycle rule: hapus file >24 jam otomatis |
| Functions | Gen 2, 512MB, timeout 60s | Trigger: cleanup file expired, usage aggregation |
| Hosting | CDN global (opsional untuk static assets) | Bisa juga serve static dari Cloud Run |

### 6.3 Environment Variables

| Variable | Environment | Nilai / Keterangan |
|---|---|---|
| `FREEMIUM_ENABLED` | All | `false` — ubah ke `true` untuk aktivasi |
| `REQUIRE_AUTH` | All | `false` — ubah ke `true` jika perlu wajib login |
| `ANTHROPIC_API_KEY` | Production only | API key Anthropic, disimpan di Secret Manager |
| `FIREBASE_ADMIN_SDK` | Production only | Service account JSON, Secret Manager |
| `REDIS_URL` | All | Upstash Redis URL untuk rate limiting |
| `MAX_FILE_SIZE_MB` | All | `200` (pro) / `20` (free, saat freemium aktif) |
| `TEMP_STORAGE_TTL_HOURS` | All | `24` jam untuk file output di Firebase Storage |

### 6.4 CI/CD Pipeline

**Branch strategy:** `main` → production, `develop` → staging, `feature/*` → preview deployments

- Push ke `feature/*` → Cloud Build: lint, test, build Docker image, deploy ke Cloud Run preview
- Merge ke `develop` → Deploy ke staging environment
- Merge ke `main` → Deploy ke production dengan zero-downtime rolling update
- Environment variables di-inject dari Google Secret Manager per environment

---

## 7. Keamanan & Privasi

### 7.1 File Security

- Semua file diupload melalui HTTPS, tidak pernah disimpan permanent tanpa consent user
- File temporer di Firebase Storage dihapus otomatis setelah 24 jam (lifecycle rule)
- Signed URL dengan expiry 1 jam untuk download, tidak bisa diakses oleh user lain
- **File tidak pernah dikirim ke Claude API** — hanya metadata dan parameter yang dikirim
- Server-side processing: file tidak meninggalkan Cloud Run container selama processing

### 7.2 API Security

- Firebase App Check untuk prevent abuse dari non-app client
- Rate limiting per IP (anonymous) dan per user ID (authenticated)
- Input validation: MIME type check, file header validation, size limits
- CSRF protection via Firebase session cookies (`SameSite=Strict`)
- Firestore security rules diterapkan ketat per collection

### 7.3 Compliance

- **GDPR-ready:** user dapat menghapus semua data melalui account settings
- Tidak menyimpan konten file — hanya metadata operasi untuk analytics
- Privacy policy eksplisit: file diproses di memori, tidak discan atau dianalisis kontennya

---

## 8. UI/UX Design Guidelines

### 8.1 Design System

Menggunakan **Minimalist Modern** design system dengan signature Electric Blue gradient (`#0052FF → #4D7CFF`).

| Elemen | Spesifikasi |
|---|---|
| Primary font | Inter (UI), Calistoga (display) via Google Fonts |
| Accent color | `#0052FF → #4D7CFF` gradient |
| Background | `#FAFAFA` (primary), `#F1F5F9` (muted) |
| Border radius | `xl` (12px) untuk card, `lg` (8px) untuk input |
| Spacing unit | 4px base grid, section `py-28` hingga `py-44` |
| Shadow | `sm/md/lg/xl` + accent-tinted variant (`rgba(0,82,255,0.25)`) |

### 8.2 Key UX Flows

**Upload & Process:**

1. Drag & drop zone besar di tengah halaman (minimal 400px tall)
2. Support multi-file upload untuk operasi batch
3. Preview thumbnail langsung setelah upload
4. Parameter panel slide-in dari kanan dengan suggestion dari Agentic layer
5. Progress bar real-time via Server-Sent Events (SSE)
6. Preview hasil before/after dengan slider untuk perbandingan visual
7. Download button prominent dengan file size comparison

**Navigasi & Discovery:**

- Homepage: featured tools dengan search bar di atas
- Kategori: PDF Tools, Image Tools, (Coming Soon: Video, Document)
- Deep link ke setiap tool: `/tools/compress-pdf`, `/tools/resize-image`, dll
- Recent operations history untuk user yang login

---

## 9. Metrics & Success Criteria

### 9.1 Launch Criteria (v1.0)

| Metric | Target | Cara Ukur |
|---|---|---|
| Core tools functional (P0) | 10/10 tools tanpa error | E2E test suite |
| Processing success rate | > 99% untuk file standar | Cloud Monitoring error rate |
| P95 processing time (PDF < 5MB) | < 8 detik | Latency histogram Cloud Run |
| P95 processing time (image < 2MB) | < 3 detik | Latency histogram |
| Mobile usability score | > 90 Lighthouse | Lighthouse CI in pipeline |
| Uptime SLA | > 99.5% | Cloud Monitoring uptime check |

### 9.2 Growth Metrics (Post-Launch)

- **DAU/MAU ratio** — target > 20% (indikasi habit-forming product)
- **Tool completion rate** — % user yang selesai download setelah upload > 80%
- **Return rate** — % user yang kembali dalam 7 hari > 30%
- **Organic traffic share** — > 50% dari total traffic (SEO-driven)

---

## 10. Roadmap & Timeline

| Phase | Timeline | Deliverable |
|---|---|---|
| **Phase 0: Foundation** | Minggu 1–2 | Setup Cloud Run, Firebase, CI/CD pipeline, auth system, usage tracking skeleton |
| **Phase 1: Core PDF Tools** | Minggu 3–4 | Compress, Merge, Split, PDF↔Image (P0 tools), basic UI |
| **Phase 2: Core Image Tools** | Minggu 5–6 | Compress, Resize, Convert format (P0 tools), full design system implementation |
| **Phase 3: P1 Features** | Minggu 7–8 | Rotate, Watermark, Crop, Remove BG, Extract Pages, Batch processing |
| **Phase 4: Polish & Launch** | Minggu 9–10 | Performance optimization, SEO, a11y audit, soft launch |
| **Phase 5: Freemium Activation** | TBD (post PMF) | Aktifkan `FREEMIUM_ENABLED=true`, Stripe integration, upgrade flow |
| **Phase 6: P2 Features** | TBD | PDF to Word, Protect PDF, advanced agentic features |

---

## Appendix A: Firestore Data Model

```
users/{uid}
  ├── profile: { email, display_name, plan, created_at }
  ├── usage/{YYYY-MM}: { operations_by_type, total_mb, count }
  └── operations/{op_id}: { type, status, input_size, output_url, created_at }

app_config/
  └── feature_flags: { freemium_enabled, require_auth, show_upgrade_cta }
```

---

## Appendix B: API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/upload` | Optional | Upload file ke Firebase Storage temp, return `file_id` |
| `POST` | `/api/process` | Optional | Start processing job, return `job_id`, stream progress via SSE |
| `GET` | `/api/jobs/:id` | Optional | Get job status dan result URL |
| `GET` | `/api/jobs/:id/stream` | Optional | SSE stream untuk progress real-time |
| `DELETE` | `/api/files/:id` | Required | Hapus file dari storage sebelum TTL |
| `GET` | `/api/user/usage` | Required | Get usage stats user bulan ini |
| `GET` | `/api/user/history` | Required | Riwayat operasi 30 hari terakhir |
| `POST` | `/api/auth/merge-session` | Required | Merge anonymous session ke akun setelah login |

---

*FileTools PRD v1.0 — Confidential — For Internal Use Only*
