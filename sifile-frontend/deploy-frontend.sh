#!/bin/bash
# Skrip helper untuk instruksi deployment SiFile Frontend ke Firebase App Hosting

PROJECT_ID="sifile-app" # Ganti jika nama project berbeda

echo "🚀 Mendeploy SiFile Frontend ke Firebase"
echo "--------------------------------------------------------"
echo "Untuk Next.js, Firebase memiliki 2 jalur deployment utama:"
echo ""
echo "JALUR 1: Firebase Hosting (Web Frameworks) - Paling Cepat via CLI"
echo "Pastikan Anda sudah menginstal firebase-tools (npm i -g firebase-tools)"
echo "1. Login: firebase login"
echo "2. Pilih Project: firebase use $PROJECT_ID"
echo "3. Deploy: firebase deploy --only hosting"
echo ""
echo "JALUR 2: Firebase App Hosting - Integrasi GitHub (Rekomendasi Produksi)"
echo "App Hosting akan otomatis mem-build dan deploy setiap kali Anda push ke GitHub."
echo "1. Buka Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID/apphosting"
echo "2. Klik 'Get Started' lalu hubungkan repositori GitHub ini."
echo "3. Setiap kali Anda push ke branch main, Firebase akan otomatis deploy."
echo "--------------------------------------------------------"
echo "Catatan: Pastikan NEXT_PUBLIC_BACKEND_URL dan env lainnya sudah diatur di Firebase Console."
