# Agent Configuration - Agents.md Format

## Project Overview
```yaml
name: "Arabic AI Project"
version: "1.0.0"
description: "Professional Arabic-enabled web application with AI integration"
author: "Rayan"
license: "MIT"
```

---

## Agent Capabilities

### Primary Functions
- 🚀 **Full-stack Development**: React, TypeScript, Node.js
- 🌐 **Arabic Language Support**: RTL, i18n, Arabic fonts
- 🤖 **AI Integration**: Claude API, OpenAI, custom AI agents
- 🔒 **Security**: Authentication, authorization, data protection
- 📊 **Database Management**: MongoDB, PostgreSQL, Prisma
- ⚡ **Performance Optimization**: Caching, lazy loading, code splitting
- 🧪 **Testing**: Unit, integration, E2E testing
- 📚 **Documentation**: Clear, comprehensive docs in Arabic & English

---

## Tech Stack

### Frontend
```yaml
framework: "React 18+"
language: "TypeScript"
styling: "Tailwind CSS"
state_management: "React Context / Zustand"
routing: "React Router v6"
forms: "React Hook Form + Zod"
i18n: "react-i18next"
```

### Backend
```yaml
runtime: "Node.js 20+"
framework: "Express / Fastify"
language: "TypeScript"
database: "MongoDB / PostgreSQL"
orm: "Mongoose / Prisma"
authentication: "JWT / OAuth"
validation: "Joi / Zod"
```

### AI & APIs
```yaml
ai_models:
  - "Claude Sonnet 4.5"
  - "GPT-4o"
  - "Custom fine-tuned models"
api_integrations:
  - "Anthropic Claude API"
  - "OpenAI API"
  - "Custom REST APIs"
```

### DevOps
```yaml
containerization: "Docker"
ci_cd: "GitHub Actions"
hosting: "Vercel / Netlify / AWS"
monitoring: "Sentry / LogRocket"
```

---

## Development Workflow

### 1. Planning Phase
```markdown
- Gather requirements (Arabic & English)
- Create technical specifications
- Design database schema
- Plan API endpoints
- Design UI/UX wireframes
```

### 2. Development Phase
```markdown
- Set up project structure
- Configure TypeScript & ESLint
- Implement authentication
- Build API endpoints
- Create React components
- Integrate AI services
- Add Arabic language support
- Implement responsive design
```

### 3. Testing Phase
```markdown
- Write unit tests (Jest/Vitest)
- Integration tests
- E2E tests (Playwright/Cypress)
- Performance testing
- Security audits
- Accessibility testing
```

### 4. Deployment Phase
```markdown
- Build optimization
- Environment configuration
- CI/CD pipeline setup
- Production deployment
- Monitoring setup
- Documentation finalization
```

---

## Code Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint Rules
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ]
  }
}
```

---

## Arabic Language Guidelines

### RTL Support
```typescript
// Always set direction for Arabic content
<div dir="rtl" lang="ar" className="font-arabic">
  {/* Arabic content */}
</div>

// Use Tailwind RTL variants
<div className="mr-4 rtl:ml-4 rtl:mr-0">
  {/* Content */}
</div>
```

### Font Configuration
```css
@font-face {
  font-family: 'Cairo';
  src: url('/fonts/Cairo-Regular.ttf') format('truetype');
  font-weight: 400;
}

@font-face {
  font-family: 'Tajawal';
  src: url('/fonts/Tajawal-Regular.ttf') format('truetype');
  font-weight: 400;
}

.font-arabic {
  font-family: 'Cairo', 'Tajawal', sans-serif;
}
```

### i18n Configuration
```typescript
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: { /* ... */ } },
      en: { translation: { /* ... */ } }
    },
    lng: "ar",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });
```

---

## Security Best Practices

### Environment Variables
```env
# Never commit these to Git!
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=your-super-secret-key-change-this
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# CORS Origins
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Security Headers
```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## API Documentation Template

### Endpoint Structure
```yaml
endpoint: "/api/v1/users"
method: "GET"
description: "Retrieve paginated list of users"
authentication: "Required (JWT)"
authorization: "Admin, User"

parameters:
  query:
    - name: page
      type: number
      default: 1
    - name: limit
      type: number
      default: 10

response:
  success:
    code: 200
    body: { users: [], total: 0 }
  error:
    code: 400
    body: { message: "Invalid parameters" }
```

---

## Performance Guidelines

### Code Splitting
```typescript
// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### Image Optimization
```typescript
// Use next/image or optimized lazy loading
<img
  src={imageUrl}
  loading="lazy"
  alt="Description"
  width={800}
  height={600}
/>
```

### Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

---

## Testing Strategy

### Unit Tests
```typescript
// UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('displays user name in Arabic', () => {
    render(<UserCard name="أحمد" />);
    expect(screen.getByText('أحمد')).toBeInTheDocument();
  });
});
```

### API Tests
```typescript
// api.test.ts
import request from 'supertest';
import app from './app';

describe('GET /api/users', () => {
  it('returns paginated users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(10);
  });
});
```

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Documentation updated
- [ ] Arabic content reviewed
- [ ] Accessibility tested
- [ ] Mobile responsive verified

### Post-deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify API endpoints
- [ ] Test critical user flows
- [ ] Confirm Arabic text rendering
- [ ] Monitor database performance
- [ ] Set up alerts
- [ ] Update changelog

---

## AI Agent Instructions

### When Creating Components
1. Use TypeScript with proper type definitions
2. Add RTL support for Arabic content
3. Implement proper error boundaries
4. Follow accessibility guidelines
5. Write comprehensive tests
6. Add JSDoc comments in Arabic
7. Use semantic HTML
8. Optimize for performance

### When Building APIs
1. Follow RESTful principles
2. Implement proper validation
3. Add authentication & authorization
4. Use consistent error handling
5. Support bilingual responses
6. Add rate limiting
7. Document all endpoints
8. Write integration tests

### When Integrating AI
1. Handle API errors gracefully
2. Implement retry logic
3. Add request timeouts
4. Cache responses when appropriate
5. Monitor token usage
6. Support streaming responses
7. Add fallback mechanisms
8. Test with various inputs

---

## Project Structure
```
project/
├── src/
│   ├── components/       # React components
│   │   ├── common/      # Shared components
│   │   ├── arabic/      # Arabic-specific components
│   │   └── features/    # Feature components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   │   ├── api/        # REST API calls
│   │   ├── ai/         # AI integrations
│   │   └── auth/       # Authentication
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── contexts/        # React contexts
│   ├── styles/          # Global styles
│   └── locales/         # i18n translations
│       ├── ar/         # Arabic translations
│       └── en/         # English translations
├── api/                 # Backend API
│   ├── routes/         # API routes
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── middleware/     # Express middleware
│   ├── services/       # Business logic
