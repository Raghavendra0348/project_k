# 🤝 Contributing to QR-Based Vending Machine System

Thank you for considering contributing to this project! We welcome contributions from everyone.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## 🎯 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title**: Descriptive summary of the issue
- **Steps to reproduce**: Detailed steps to reproduce the behavior
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**: OS, browser, Node.js version, etc.

Example:
```markdown
## Bug: Payment fails with UPI on mobile

**Steps to reproduce:**
1. Open machine page on mobile Chrome
2. Select any product
3. Click "Buy Now"
4. Choose UPI option
5. Payment modal closes without completing

**Expected:** Payment should complete successfully
**Actual:** Modal closes, order status remains pending

**Environment:**
- OS: Android 12
- Browser: Chrome 98
- Device: Samsung Galaxy S21
```

### Suggesting Features

Feature requests are welcome! Please include:

- **Problem statement**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought about
- **Additional context**: Mockups, examples, etc.

---

## 🛠️ Development Setup

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/project1.git
cd project1
git remote add upstream https://github.com/ORIGINAL_OWNER/project1.git
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../functions
npm install
```

### 3. Set Up Environment

```bash
# Copy example env files
cp frontend/.env.example frontend/.env
cp functions/.env.example functions/.env

# Edit with your credentials
nano frontend/.env
nano functions/.env
```

### 4. Start Development Servers

```bash
# Terminal 1: Frontend
cd frontend
npm start

# Terminal 2: Backend
cd ..
firebase emulators:start
```

### 5. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

---

## 💻 Coding Standards

### JavaScript/TypeScript

- **Style Guide**: Google JavaScript Style Guide
- **Linting**: ESLint with Google config
- **Formatting**: Prettier (2 spaces, single quotes)

#### Code Style

```javascript
// ✅ Good
const createOrder = async (productId, amount) => {
  try {
    const order = await razorpay.createOrder({
      amount: amount * 100,
      currency: 'INR',
    });
    return order;
  } catch (error) {
    logger.error('Order creation failed', error);
    throw error;
  }
};

// ❌ Bad
const createOrder = async (productId,amount) =>
{
    try{
        const order = await razorpay.createOrder({amount: amount*100, currency: "INR"})
        return order
    }catch(error){
        console.log(error)
        throw error
    }
}
```

### React Components

- Use **functional components** with hooks
- Use **descriptive names** (PascalCase)
- Keep components **small and focused**
- Add **JSDoc comments** for complex logic

```javascript
/**
 * Product Card Component
 * 
 * Displays individual product with real-time stock updates.
 * Handles out-of-stock state and purchase initiation.
 */
const ProductCard = ({ product, onPurchase }) => {
  const isOutOfStock = product.stock === 0;
  
  return (
    <div className="product-card">
      {/* Component JSX */}
    </div>
  );
};
```

### TypeScript (Backend)

- **Explicit types** for function parameters and return values
- **Interfaces** for complex objects
- **Avoid `any`** type when possible

```typescript
// ✅ Good
interface CreateOrderRequest {
  productId: string;
  machineId: string;
  amount: number;
}

const createOrderHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Implementation
};

// ❌ Bad
const createOrderHandler = async (req: any, res: any) => {
  // Implementation
};
```

### CSS/Tailwind

- Use **Tailwind utility classes** when possible
- Keep custom CSS minimal
- Use **semantic class names** for custom CSS
- Maintain **mobile-first** approach

```jsx
// ✅ Good
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Buy Now
</button>

// ❌ Bad
<button style={{ padding: '12px 24px', backgroundColor: 'blue' }}>
  Buy Now
</button>
```

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Good commits
git commit -m "feat(payment): add UPI payment option"
git commit -m "fix(stock): prevent negative stock values"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(api): simplify order creation logic"

# Bad commits
git commit -m "fixed stuff"
git commit -m "update"
git commit -m "asdfasdf"
```

### Detailed Commit

```
feat(qr-scanner): add camera permission handling

- Add permission request dialog
- Handle permission denial gracefully
- Show helpful error messages to users
- Add fallback to manual machine ID entry

Closes #123
```

---

## 🔀 Pull Request Process

### Before Submitting

1. **Update your branch** with latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** and ensure they pass:
   ```bash
   npm test
   ```

3. **Lint your code**:
   ```bash
   npm run lint
   ```

4. **Build successfully**:
   ```bash
   # Frontend
   cd frontend && npm run build
   
   # Backend
   cd functions && npm run build
   ```

5. **Update documentation** if needed

### Submitting Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub** with:
   - Clear title describing the change
   - Reference to related issues (#123)
   - Description of what changed and why
   - Screenshots for UI changes
   - Testing notes

### PR Template

```markdown
## Description
Brief description of the change

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Changes Made
- Added QR scanner permission handling
- Improved error messages
- Updated documentation

## Screenshots
(if applicable)

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on mobile Safari
- [ ] All tests pass
- [ ] No console errors

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### Review Process

- Maintainers will review your PR
- Address feedback by pushing new commits
- Once approved, your PR will be merged
- Delete your branch after merge

---

## 🐛 Reporting Bugs

### Use GitHub Issues

1. Go to [Issues](https://github.com/YOUR_USERNAME/project1/issues)
2. Click "New Issue"
3. Choose "Bug Report" template
4. Fill in all sections
5. Add appropriate labels

### Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead:
- Email: security@example.com
- Include detailed description
- Wait for response before disclosure

---

## 💡 Suggesting Features

### Feature Request Process

1. **Search existing requests** to avoid duplicates
2. **Create new issue** with "Feature Request" template
3. **Describe the problem** it solves
4. **Propose a solution** with details
5. **Add mockups/examples** if helpful

### Feature Discussions

Join discussions in:
- GitHub Discussions
- Feature request issues
- Community chat (if available)

---

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd functions
npm test

# E2E tests
npm run test:e2e
```

### Writing Tests

- Write tests for new features
- Update tests for bug fixes
- Aim for good coverage
- Test edge cases

```javascript
// Example test
describe('ProductCard', () => {
  it('should disable buy button when out of stock', () => {
    const product = { id: '1', name: 'Coke', stock: 0 };
    const { getByText } = render(<ProductCard product={product} />);
    const button = getByText('Out of Stock');
    expect(button).toBeDisabled();
  });
});
```

---

## 📚 Additional Resources

- [Setup Guide](SETUP.md)
- [User Guide](QR_USER_GUIDE.md)
- [Architecture](ARCHITECTURE.md)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)

---

## 🎉 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Eligible for contributor badge

---

## ❓ Questions?

- GitHub Discussions
- Email: support@example.com
- Community chat

---

**Thank you for contributing! 🙏**
