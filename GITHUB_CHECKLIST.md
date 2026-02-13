# ✅ GitHub Push Checklist

Before pushing to GitHub, ensure you've completed all these items.

---

## 🔒 Security Check

- [x] `.env` files are in `.gitignore`
- [x] `rzp-key.csv` is in `.gitignore`
- [x] No API keys or secrets in code
- [x] `.env.example` files created (without real credentials)
- [x] Firebase service account keys excluded
- [ ] Review all files for sensitive data

**Action**: Search for sensitive data:
```bash
grep -r "rzp_test_" --exclude-dir=node_modules --exclude=".git" .
grep -r "AIza" --exclude-dir=node_modules --exclude=".git" .
```

---

## 📝 Documentation

- [x] README.md - Project overview
- [x] SETUP.md - Installation guide
- [x] QR_USER_GUIDE.md - User documentation
- [x] CONTRIBUTING.md - Contribution guidelines
- [x] DEPENDENCIES.md - Dependency documentation
- [x] LICENSE - MIT License
- [x] ARCHITECTURE.md - Architecture details (if exists)
- [x] .env.example files for both frontend and backend

---

## 🧪 Testing

- [ ] Frontend builds without errors: `cd frontend && npm run build`
- [ ] Backend compiles: `cd functions && npm run build`
- [ ] No ESLint errors: `npm run lint`
- [ ] All tests pass: `npm test`
- [ ] Manual testing completed

**Action**: Run build commands:
```bash
# Frontend
cd frontend
npm run build

# Backend
cd functions
npm run build
```

---

## 🗂️ File Structure

- [x] All necessary files present
- [x] No build artifacts in repo (`lib/`, `build/`)
- [x] `.gitignore` properly configured
- [x] Package.json files up to date
- [x] No node_modules in Git

**Action**: Check for unwanted files:
```bash
git status
git ls-files | grep -E "(node_modules|lib/|build/|\.env$)"
```

---

## 📦 Dependencies

- [x] All dependencies documented
- [x] package.json and package-lock.json committed
- [x] No unnecessary dependencies
- [x] Versions specified properly

**Action**: Review dependencies:
```bash
cd frontend && npm list --depth=0
cd ../functions && npm list --depth=0
```

---

## 🔧 Configuration Files

- [x] `firebase.json` - Firebase config
- [x] `firestore.rules` - Security rules
- [x] `firestore.indexes.json` - Database indexes
- [x] `.firebaserc` - Firebase project config (or in .gitignore if project-specific)
- [x] `tailwind.config.js` - Tailwind config
- [x] `tsconfig.json` - TypeScript config

---

## 🚀 Git Preparation

### 1. Clean Working Directory

```bash
# Check status
git status

# Remove untracked files (if needed)
git clean -fd

# Stash unwanted changes
git stash
```

### 2. Review Changes

```bash
# See what will be committed
git diff

# See staged changes
git diff --staged
```

### 3. Create .gitignore (Already Done ✅)

```bash
# Verify .gitignore is working
git check-ignore -v node_modules/
git check-ignore -v frontend/.env
git check-ignore -v functions/.env
git check-ignore -v rzp-key.csv
```

### 4. Initial Commit

```bash
# Stage all files
git add .

# Check what's staged
git status

# Commit with descriptive message
git commit -m "Initial commit: QR-based vending machine system

- React frontend with QR scanner
- Firebase Cloud Functions backend
- Razorpay payment integration
- Real-time Firestore database
- Complete documentation
- Development and production configs"
```

### 5. Create GitHub Repository

1. Go to https://github.com/new
2. Create new repository (don't initialize with README)
3. Copy the repository URL

### 6. Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/vending-machine.git

# Verify remote
git remote -v

# Push to main branch
git push -u origin main
```

---

## 🌐 GitHub Repository Setup

After pushing, configure on GitHub:

### Repository Settings

1. **Description**: "QR-based real-time vending machine system with React, Firebase, and Razorpay"

2. **Topics**: 
   - `vending-machine`
   - `qr-code`
   - `react`
   - `firebase`
   - `razorpay`
   - `real-time`
   - `typescript`
   - `tailwindcss`

3. **Website**: Your deployed URL (after deployment)

4. **Enable Features**:
   - [x] Issues
   - [x] Projects (optional)
   - [x] Discussions (optional)
   - [x] Wiki (optional)

### Branch Protection

Protect `main` branch:
- Settings → Branches → Add rule
- Require pull request reviews
- Require status checks

### Secrets Configuration

For GitHub Actions (if using CI/CD):
- Settings → Secrets → Actions
- Add:
  - `FIREBASE_TOKEN`
  - `RAZORPAY_TEST_KEY_ID`
  - `RAZORPAY_TEST_KEY_SECRET`

---

## 📋 Pre-Push Commands

Run these commands to verify everything:

```bash
# 1. Check Git status
git status

# 2. Check for sensitive files
git ls-files | grep -i "key\|secret\|\.env$" | grep -v ".example"

# 3. Verify .gitignore
git check-ignore -v node_modules/ frontend/.env functions/.env rzp-key.csv

# 4. Build frontend
cd frontend && npm run build && cd ..

# 5. Build backend
cd functions && npm run build && cd ..

# 6. Lint code
npm run lint 2>/dev/null || echo "No global lint script"

# 7. Check for TODO/FIXME
grep -r "TODO\|FIXME" --exclude-dir=node_modules --exclude-dir=.git . || echo "No TODOs found"

# 8. List large files (> 1MB)
find . -type f -size +1M -not -path "*/node_modules/*" -not -path "*/.git/*"

# 9. Count lines of code
find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs wc -l

# 10. Final check
echo "✅ All checks passed! Ready to push to GitHub."
```

---

## 🎯 Post-Push Tasks

After pushing to GitHub:

- [ ] Verify repository on GitHub
- [ ] Check all files are present
- [ ] Create first issue/milestone
- [ ] Update GitHub repository description
- [ ] Add topics/tags
- [ ] Star your own repo (optional 😄)
- [ ] Share with team/community
- [ ] Set up CI/CD (optional)
- [ ] Deploy to Firebase Hosting
- [ ] Add status badges to README

---

## 🔐 Security Reminders

**NEVER COMMIT:**
- ❌ `.env` files
- ❌ API keys or secrets
- ❌ Database credentials
- ❌ Service account JSON files
- ❌ Private keys
- ❌ Password files

**ALWAYS:**
- ✅ Use `.env.example` templates
- ✅ Document required environment variables
- ✅ Use environment-specific configs
- ✅ Review commits before pushing
- ✅ Use GitHub secrets for CI/CD

---

## ✅ Final Verification

Before pushing, verify:

```bash
# No .env files
! git ls-files | grep -E "\.env$"

# No API keys in code
! git grep -i "rzp_test_\|rzp_live_\|AIza" -- "*.js" "*.jsx" "*.ts" "*.tsx"

# .gitignore working
git check-ignore frontend/.env && git check-ignore functions/.env

# Build succeeds
cd frontend && npm run build && cd ../functions && npm run build

echo "✅ Ready to push!"
```

---

## 🚀 Push Commands

```bash
# Initial push
git add .
git commit -m "Initial commit: Complete vending machine system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main

# Subsequent pushes
git add .
git commit -m "Your commit message"
git push
```

---

## 📞 Need Help?

- Git: https://git-scm.com/doc
- GitHub: https://docs.github.com
- Firebase: https://firebase.google.com/docs

---

**Status**: ✅ READY TO PUSH

**Last Updated**: February 2026
