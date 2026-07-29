# ✍️ Uplift — AI IELTS Writing Analyzer

> *Write. Analyze. Improve. Repeat.*

An AI-powered platform that helps IELTS students transform their essays into higher-band responses through detailed analysis, intelligent feedback, and sentence-level improvements.

---

## 🌍 Why Uplift?

Most IELTS tools only tell you **your score**.

**Uplift tells you why.**

Instead of receiving a simple band prediction, users receive a complete breakdown of their essay, discover weak areas, compare every sentence with an improved version, and understand exactly how to write like a Band 8–9 candidate.

---

## ✨ What Makes It Different?

🧠 AI Essay Evaluation

Predicts IELTS Writing band score with detailed explanations.

🔍 Sentence-by-Sentence Comparison

Compare every original sentence with an AI-improved version.

🎯 Interactive Highlights

Hover over a sentence to instantly find its improved counterpart.

📊 Detailed Feedback

Grammar • Vocabulary • Coherence • Task Achievement • Cohesion

📄 Export Results

Download the complete analysis as a PDF.

🔐 Secure Authentication

Email, phone verification, JWT authentication, and Google Sign-In.

📚 Essay History

Every submission is saved so users can track progress over time.

---

## ⚙️ Tech Stack

| Frontend | React 18 + TypeScript + Vite        |
| -------- | ----------------------------------- |
| Styling  | Tailwind CSS + shadcn/ui + Radix UI |
| State    | TanStack Query                      |
| Forms    | React Hook Form + Zod               |
| Auth     | JWT + Google OAuth                  |
| PDF      | jsPDF + html2canvas                 |

---

## 🚀 Getting Started

```bash
git clone <repository-url>

cd uplift

npm install

npm run dev
```

Create `.env.local`

```env
VITE_API_BASE_URL=
VITE_GOOGLE_CLIENT_ID=
VITE_RECAPTCHA_SITE_KEY=
```

Open:

```
http://localhost:5173
```

---

## 📂 Project Structure

```
src
├── components
├── modules
├── pages
├── hooks
├── services
├── lib
└── types
```

---

## 💡 Built For

* IELTS Students
* English Learners
* Language Institutes
* Teachers
* AI Education Platforms

---

## 📈 Future Vision

* AI Writing Coach
* Personalized Learning Roadmaps
* Speaking Analysis
* Reading & Listening Modules
* Mobile Application
* Real-time Collaboration

---

## 🛠 Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## ⭐ If you like this project...

Leave a ⭐ on the repository.

It motivates future development and helps others discover the project.

---

<p align="center">
Built to help students write better English, not just score higher.
</p>
