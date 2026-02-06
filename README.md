# 🚀 4R4S Prompt Pro

**1 IDEA → 15 SECONDS → PRO OUTPUT**
A futuristic, mobile-first web tool that transforms simple ideas into professional prompts using the **4R-4S Framework** (Role, Reason, Result, Rules / Situation, Steps, Specifics, Standards), powered by **AI Auto-Fill** and **Perplexity API**.

![Liquid Glass UI](https://via.placeholder.com/800x400.png?text=Liquid+Glass+UI+Preview)

## ✨ Key Features (v2.0)

### 🎨 Liquid Glass UI (iOS 26 Style)
- **Immersive Design**: Deep animated gradient backgrounds and translucent glassmorphism panels.
- **Neon Accents**: Glowing inputs and "liquid" buttons for a premium futuristic feel.
- **Mobile First**: Fully responsive layout optimized for all devices.

### 🧠 Smart Bilingual Engine
- **Context-Aware Auto-Fill**:
    - Type inside "Quick Idea" in **Vietnamese** -> AI fills form in **Vietnamese** & sets UI to VN.
    - Type in **English** -> AI fills form in **English** & sets UI to EN.
- **Real-Time Translation**:
    - Toggle **VN/EN** manually to instantly **translate** your entire prompt draft.
    - Dynamic UI labels (ROLE -> VAI TRÒ) update instantly.

### 📸 Multimodal Input
- **Image Support**: Attach images to your prompt idea.
- **Vision Analysis**: The AI analyzes uploaded images to generate relevant prompt context (Rules, Situation).

### ⚡ Powered by Perplexity
- **Live Testing**: One-click test via Perplexity API (Sonar, Sonar Pro, Deep Research).
- **Citations**: Real-time citations and sources included in the output.

## 🛠️ Tech Stack
- **Frontend**: HTML5, Vanilla JS (ES6+).
- **Styling**: Tailwind CSS (CDN) + Custom `style.css` (Glassmorphism).
- **Backend**: PHP 8 (No Framework) - Secure Proxy for API.
- **Security**: API Keys isolated in `config.php`.

## 📦 Installation & Deployment

### 1. Local Development
Requires PHP 8.0+.
1.  **Clone User Repo**:
    ```bash
    git clone https://github.com/your-repo/4r4s-prompt-pro.git
    cd 4r4s-prompt-pro
    ```
2.  **Configure Security**:
    -   Rename `config.sample.php` (if exists) or create `config.php`:
        ```php
        <?php
        return ['PERPLEXITY_API_KEY' => 'your-key-here'];
        ?>
        ```
    -   **Important**: Ensure `config.php` is in your `.gitignore`.
3.  **Start Server**:
    ```bash
    php -S localhost:8000
    ```
4.  **Run**: Open `http://localhost:8000`.

### 2. Deployment (InfinityFree / Shared Hosting)
1.  **Upload**: Upload all files to `htdocs` via FTP.
2.  **Secure Config**: Create `config.php` on the server with your production API Key.
3.  **Permissions**: Ensure `config.php` is not publicly accessible (handled by PHP execution usually, but `.htaccess` protection is recommended).

## 📂 File Structure
```
4r4s-prompt-pro/
├── index.html       # Main Application UI (Liquid Glass Theme)
├── style.css        # Advanced Glassmorphism & Animations
├── script.js        # Core Logic (Bilingual Engine, Auto-Fill)
├── api.php          # Secure Proxy (Loads key from config)
├── classify.php     # System Prompt & Language Detection
├── config.php       # [IGNORED] Stores API Credentials
├── templates.json   # 20+ Built-in Templates
└── history.json     # Placeholder
```

## 🤝 Contributing
Feel free to open issues! We are currently focusing on:
- Adding "Deep Research" mode.
- Exporting to PDF.

## 📄 License
MIT License.
