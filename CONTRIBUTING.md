# 🤝 Contributing to Deeb Alex

Thank you for your interest in contributing! Here's how you can help improve Deeb Alex.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/deeb-alex.git`
3. **Create** a feature branch: `git checkout -b feature/your-feature`
4. **Make** your changes
5. **Commit**: `git commit -m "Add your feature"`
6. **Push**: `git push origin feature/your-feature`
7. **Create** a Pull Request

## Code Standards

### JavaScript/React
- Use ES6+ syntax
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### File Organization
```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── api/           # API calls
│   ├── store/         # State management
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utility functions
│   ├── i18n/          # Translations
│   └── styles/        # Global styles

backend/
├── routes/            # API routes
├── models/            # Data models
├── middleware/        # Custom middleware
├── config/            # Configuration
└── controllers/       # Business logic
```

## Adding New Tools

### 1. Add Tool Definition
```javascript
// frontend/src/data/tools.js
{
  id: 'new-tool-id',
  name: 'New Tool Name',
  icon: '🔧',
  description: 'Tool description',
  isPremium: false,
  category: 'mobile' // or 'desktop'
}
```

### 2. Create Tool Component
```javascript
// frontend/src/components/tools/NewTool.jsx
export default function NewTool() {
  // Component code
}
```

### 3. Add Backend Route
```javascript
// backend/routes/tools.js
router.post('/new-tool/execute', verifyToken, async (req, res) => {
  // Tool execution logic
});
```

## Adding Translations

1. Update language files in `frontend/src/i18n/locales/`
2. Add key-value pairs for new strings
3. Use `useTranslation()` hook in components

```javascript
const { t } = useTranslation();
<h1>{t('new.translation.key')}</h1>
```

## Testing

### Run Tests
```bash
cd frontend && npm test
cd backend && npm test
```

### Test Coverage
Aim for at least 80% code coverage on critical paths.

## Bug Reports

Before reporting:
- Check if bug already exists
- Provide detailed reproduction steps
- Include error messages and logs
- Specify OS, browser, and versions

## Feature Requests

Include:
- Clear description
- Use case and benefits
- Mockups or examples
- Potential implementation approach

## Commit Messages

Use format:
```
[TYPE] Brief description

Detailed explanation if needed

Types: feat, fix, docs, style, refactor, test, chore
```

Example:
```
[feat] Add new phishing detector tool

- Implement advanced phishing detection algorithm
- Add unit tests for detector
- Update documentation
```

## Pull Request Process

1. **Update** `CHANGELOG.md`
2. **Test** thoroughly on local environment
3. **Add** comments for complex logic
4. **Request** review from maintainers
5. **Address** feedback and re-test
6. **Merge** once approved

## Code Review Guidelines

Reviewers will check:
- ✅ Code quality and standards
- ✅ Tests and coverage
- ✅ Documentation
- ✅ Security implications
- ✅ Performance impact

## Community

- 💬 Join our Discord
- 📧 Email: community@deebAlex.com
- 🐦 Follow on Twitter
- 📝 Read our Blog

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Deeb Alex!** 🙏
