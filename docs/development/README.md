# 👩‍💻 Development Guide

Development workflows, coding standards, and contribution guidelines for Sunshine Restaurant.

## 🎯 Getting Started

### Prerequisites for Contributors

1. **Development Environment**: Complete [Setup Guide](../setup/README.md)
2. **Code Editor**: VS Code with recommended extensions
3. **Git Knowledge**: Basic understanding of Git workflows
4. **Restaurant Domain**: Understanding of restaurant operations helpful

### Project Structure

```
sunshine_restaurant/
├── 📱 src/app/                    # Next.js 15 App Router
│   ├── (auth)/                   # Authentication pages
│   ├── admin/                    # Admin panel routes
│   ├── api/                      # API routes (if any)
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
│
├── 🧩 src/components/            # React Components
│   ├── admin/                    # Admin-specific components
│   ├── layout/                   # Layout components (header, footer)
│   ├── ui/                       # shadcn/ui base components
│   └── features/                 # Feature-specific components
│
├── 🔧 src/lib/                   # Utility Libraries
│   ├── utils.ts                  # General utilities
│   ├── validations.ts            # Zod validation schemas
│   ├── constants.ts              # Application constants
│   └── auth.ts                   # Authentication utilities
│
├── 🗄️ convex/                    # Convex Backend
│   ├── schema.ts                 # Database schema
│   ├── auth.ts                   # Auth functions
│   ├── meals.ts                  # Meal operations
│   ├── orders.ts                 # Order operations
│   └── _generated/               # Auto-generated types
│
└── 📚 docs/                      # Documentation
    ├── setup/                    # Setup guides
    ├── admin/                    # Admin documentation
    ├── api/                      # API documentation
    └── development/              # Development guides
```

---

## 🏗️ Development Workflow

### Branch Strategy

We use **Git Flow** with the following branches:

#### Main Branches
- **`main`**: Production-ready code
- **`develop`**: Integration branch for features

#### Supporting Branches
- **`feature/feature-name`**: New features
- **`bugfix/bug-description`**: Bug fixes
- **`hotfix/critical-fix`**: Emergency production fixes

### Workflow Example

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/meal-image-upload

# Make changes, commit regularly
git add .
git commit -m "feat: add image upload component for meals"

# Push feature branch
git push origin feature/meal-image-upload

# Create pull request to develop branch
```

### Commit Message Convention

We follow **Conventional Commits** for clear commit history:

```bash
# Format: type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore

# Examples:
feat(admin): add meal management dashboard
fix(auth): resolve login redirect issue
docs(setup): update installation instructions
style(ui): improve button hover animations
refactor(api): optimize meal query performance
test(orders): add order creation unit tests
chore(deps): update dependencies to latest versions
```

---

## 📐 Coding Standards

### TypeScript Guidelines

#### Type Safety First
```typescript
// ✅ Good: Explicit types
interface MealFormData {
  name: string
  description: string
  price: number
  categoryId: Id<"categories">
  dietary: {
    vegetarian: boolean
    vegan: boolean
    halal: boolean
  }
}

// ❌ Avoid: any types
const mealData: any = { ... }
```

#### Use Zod for Validation
```typescript
import { z } from "zod"

const mealSchema = z.object({
  name: z.string().min(1, "Meal name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required")
})

type MealFormData = z.infer<typeof mealSchema>
```

### React Component Guidelines

#### Component Structure
```typescript
// Component file structure
import React from 'react'
import { useState, useEffect } from 'react'
// External imports
import { Button } from '@/components/ui/button'
// Internal imports
import { useMeals } from '@/hooks/use-meals'

// Types/Interfaces
interface MealCardProps {
  meal: {
    _id: Id<"meals">
    name: string
    price: number
    description: string
  }
  onEdit?: () => void
}

// Component
export function MealCard({ meal, onEdit }: MealCardProps) {
  // Hooks first
  const [isLoading, setIsLoading] = useState(false)
  
  // Event handlers
  const handleEdit = () => {
    onEdit?.()
  }

  // Early returns
  if (!meal) return null

  // Render
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">{meal.name}</h3>
      <p className="text-gray-600">{meal.description}</p>
      <div className="flex justify-between items-center mt-4">
        <span className="font-bold">{meal.price} XAF</span>
        {onEdit && (
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </div>
    </div>
  )
}
```

#### Custom Hooks
```typescript
// hooks/use-meals.ts
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

export function useMeals(categoryId?: Id<"categories">) {
  const meals = useQuery(api.meals.getAll, { categoryId })
  
  return {
    meals,
    isLoading: meals === undefined,
    isEmpty: meals?.length === 0
  }
}
```

### CSS/Styling Guidelines

#### Tailwind CSS Classes
```typescript
// ✅ Good: Organized classes
<div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">

// ✅ Good: Use CSS variables for theme colors
<div className="bg-primary text-primary-foreground">

// ❌ Avoid: Custom CSS when Tailwind classes exist
<div style={{ padding: '16px', backgroundColor: '#f3f4f6' }}>
```

#### Component Variants with CVA
```typescript
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

---

## 🧪 Testing Standards

### Unit Testing

#### Component Testing
```typescript
// __tests__/components/meal-card.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MealCard } from '@/components/admin/meal-card'

const mockMeal = {
  _id: "meal123" as Id<"meals">,
  name: "Jollof Rice",
  description: "Traditional West African rice dish",
  price: 2500
}

describe('MealCard', () => {
  it('renders meal information correctly', () => {
    render(<MealCard meal={mockMeal} />)
    
    expect(screen.getByText('Jollof Rice')).toBeInTheDocument()
    expect(screen.getByText('Traditional West African rice dish')).toBeInTheDocument()
    expect(screen.getByText('2500 XAF')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = jest.fn()
    render(<MealCard meal={mockMeal} onEdit={onEdit} />)
    
    await userEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
```

#### Hook Testing
```typescript
// __tests__/hooks/use-meals.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useMeals } from '@/hooks/use-meals'

jest.mock('convex/react', () => ({
  useQuery: jest.fn()
}))

describe('useMeals', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useMeals())
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.meals).toBeUndefined()
  })
})
```

### Integration Testing

#### API Testing
```typescript
// __tests__/convex/meals.test.ts
import { convexTest } from "convex-test"
import { api } from "../convex/_generated/api"

describe('Meals API', () => {
  it('creates a new meal successfully', async () => {
    const t = convexTest()
    
    const categoryId = await t.mutation(api.categories.create, {
      name: "Main Courses",
      description: "Hearty main dishes"
    })

    const mealId = await t.mutation(api.meals.create, {
      name: "Jollof Rice with Chicken",
      description: "Traditional West African dish",
      price: 3500,
      categoryId
    })

    const meal = await t.query(api.meals.getById, { id: mealId })
    
    expect(meal?.name).toBe("Jollof Rice with Chicken")
    expect(meal?.price).toBe(3500)
  })
})
```

---

## 🏆 Code Quality

### ESLint Configuration

`.eslintrc.json`:
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### Prettier Configuration

`.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## 📚 Documentation Standards

### Component Documentation

```typescript
/**
 * MealCard displays meal information with optional edit functionality
 * 
 * @param meal - The meal object containing name, description, and price
 * @param onEdit - Optional callback function called when edit button is clicked
 * 
 * @example
 * ```tsx
 * <MealCard 
 *   meal={mealData} 
 *   onEdit={() => navigate('/admin/meals/edit')} 
 * />
 * ```
 */
export function MealCard({ meal, onEdit }: MealCardProps) {
  // Component implementation
}
```

### API Documentation

```typescript
/**
 * Retrieves all meals with optional filtering
 * 
 * @param categoryId - Optional category filter
 * @param dietary - Optional dietary restrictions filter
 * @returns Array of meals matching criteria
 * 
 * @example
 * ```typescript
 * // Get all vegetarian meals in main courses category
 * const meals = await getMeals({
 *   categoryId: "category123",
 *   dietary: { vegetarian: true }
 * })
 * ```
 */
export const getMeals = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    dietary: v.optional(v.object({
      vegetarian: v.optional(v.boolean())
    }))
  },
  handler: async (ctx, args) => {
    // Implementation
  }
})
```

---

## 🚀 Performance Guidelines

### React Performance

#### Optimize Re-renders
```typescript
// ✅ Good: Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return meals.filter(meal => meal.featured)
}, [meals])

// ✅ Good: Memoize callback functions
const handleMealEdit = useCallback((mealId: Id<"meals">) => {
  navigate(`/admin/meals/${mealId}/edit`)
}, [navigate])

// ✅ Good: Split large components
function MealList({ meals }: { meals: Meal[] }) {
  return (
    <div className="grid gap-4">
      {meals.map(meal => (
        <MealCard key={meal._id} meal={meal} />
      ))}
    </div>
  )
}
```

#### Image Optimization
```typescript
import Image from 'next/image'

// ✅ Good: Use Next.js Image component
<Image
  src={meal.imageUrl}
  alt={meal.name}
  width={400}
  height={300}
  className="rounded-lg"
  priority={meal.featured}
/>
```

### Convex Performance

#### Efficient Queries
```typescript
// ✅ Good: Specific queries with indexes
export const getMealsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meals")
      .withIndex("by_category", q => q.eq("categoryId", args.categoryId))
      .collect()
  }
})

// ❌ Avoid: Fetching all data and filtering in JS
export const getAllMeals = query({
  handler: async (ctx) => {
    const allMeals = await ctx.db.query("meals").collect()
    return allMeals.filter(meal => meal.categoryId === "someId")
  }
})
```

---

## 🐛 Debugging Guidelines

### Development Tools

#### Browser DevTools
- **React DevTools**: Component hierarchy and state inspection
- **Network Tab**: API request monitoring
- **Performance Tab**: React rendering performance
- **Console**: Error tracking and debugging

#### VS Code Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next-dev",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Error Handling

#### Frontend Error Boundaries
```typescript
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>
    }

    return this.props.children
  }
}
```

#### Convex Error Handling
```typescript
export const createMeal = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    try {
      // Validate inputs
      if (args.price <= 0) {
        throw new Error("Price must be positive")
      }

      // Create meal
      const mealId = await ctx.db.insert("meals", {
        ...args,
        createdAt: Date.now()
      })

      return mealId
    } catch (error) {
      console.error("Failed to create meal:", error)
      throw new Error("Failed to create meal")
    }
  }
})
```

---

## 📋 Pull Request Guidelines

### Before Submitting

1. **Run Tests**: Ensure all tests pass
   ```bash
   npm run test
   npm run type-check
   npm run lint
   ```

2. **Check Build**: Verify production build works
   ```bash
   npm run build
   ```

3. **Update Documentation**: Document new features or changes

### Pull Request Template

```markdown
## 🎯 Description
Brief description of the changes and why they're needed.

## 📋 Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## 📸 Screenshots (if applicable)
Add screenshots to help explain your changes.

## ✅ Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes made to documentation
- [ ] Changes generate no new warnings
- [ ] Tests added that prove fix is effective or that feature works
```

---

## 🎯 Development Best Practices

### Code Organization
1. **Single Responsibility**: Each function/component has one clear purpose
2. **DRY Principle**: Don't repeat yourself - extract common logic
3. **SOLID Principles**: Follow SOLID design principles where applicable
4. **Meaningful Names**: Use descriptive variable and function names

### Performance
1. **Lazy Loading**: Load components and routes on-demand
2. **Image Optimization**: Use Next.js Image component
3. **Bundle Optimization**: Monitor and optimize bundle size
4. **Database Queries**: Optimize Convex queries with proper indexing

### Security
1. **Input Validation**: Validate all user inputs with Zod
2. **Authentication**: Protect sensitive routes and API endpoints
3. **Error Messages**: Don't expose sensitive information in error messages
4. **Dependencies**: Keep dependencies updated and audit regularly

---

**🚀 Ready to contribute? Follow this guide to maintain code quality and consistency across the Sunshine Restaurant project!**
