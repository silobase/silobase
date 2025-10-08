### ✅ CONTRIBUTING.md

# 🤝 Contributing to Silobase

Thanks for your interest in contributing to **Silobase**! We're excited to have your help improving this open-source project.


## 📦 How to Contribute

### 1. Fork the Repository

Click the **Fork** button and clone your fork:

```bash
git clone https://github.com/silobase/silobase.git
cd silobase
npm install
```

### 2. Create a Branch
```bash
git checkout -b feat/your-feature-name
```

### 3. Make Your Changes
- Follow the coding style of the project (TypeScript, modular files).
- Add/modify unit tests where appropriate.
- Run lint and tests before committing.

### 4. Run Tests
```bash
npm test
```

### 5. Commit & Push
```bash
git add .
git commit -m "feat: add new feature"
git push origin feat/your-feature-name
```

### 6. Create Pull Request
Open a PR on GitHub with a clear title and description.

## 💡 Ideas to Contribute
- Add support for more SQL databases
- Add advanced filtering (e.g., gt, lt, like)
- Add token-based auth / rate limiting
- Add admin dashboard
- Improve unit test coverage
- Build a CLI to scaffold DB configs

## 📚 Coding Guidelines
- Use consistent TypeScript types
- Use named imports, modular structure
- Keep route logic slim—push logic into services
- Handle all API responses with GenericResponse<T>

## 🙏 Code of Conduct
Be kind, respectful, and inclusive. Harassment, bullying, and discrimination will not be tolerated.

Thank you for being awesome 🙌

Let me know if you'd like to automatically generate badges, example `curl` commands, or if you want to publish this to GitHub with setup scripts!
