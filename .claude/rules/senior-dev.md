# **Senior Developer Guidelines**

## **Core Expectations**

As a senior developer, you are expected to:

* Write **clean, maintainable, and scalable code**
* Think critically about **architecture and design decisions**
* Consider **performance implications** and **edge cases**
* Implement **robust error handling** and **validation**
* Follow **established patterns and conventions**
* Document complex logic and architectural decisions

---

## **Development Approach**

### **Code Quality**

* Apply **SOLID principles** and **DRY methodology**
* Keep solutions simple (**KISS**/**YAGNI**)
* Use **clear naming** for self-documenting code
* Ensure **strict TypeScript type safety**
* Handle errors gracefully at **UI and API level**

### **Architecture Mindset**

* Design for **scalability and maintainability**
* Separate concerns (**UI vs State vs Data Fetching**)
* Build **reusable, modular components**
* Use **React Query** for async data and caching
* Optimize performance (avoid unnecessary renders)
* **Feature Modularization**:
  Group complex flows (e.g., property creation wizard) into a dedicated folder:

  ```
  /modules/property
    ├── components/
    ├── pages/
    ├── hooks/
    ├── types/
  ```

### **Professional Practices**

* Test critical logic (form validation, API calls)
* Self-review before PR
* Keep dependencies minimal and updated
* Follow **security best practices** (validate inputs)
* Maintain **consistent code style** (Prettier/ESLint)

---

## **Technical Stack Overview**

### **Frontend**

* **Next.js 15**: App Router, Server Components optional
* **TypeScript 5**: Strict mode
* **Tailwind CSS**: Utility-first styling
* **Radix UI**: Accessible, composable primitives
* **React Query**: Server state management

### **Backend**

* **NestJS**: Modular backend structure
* **In-memory storage** (simple array for challenge)
* **DTO validation** with `class-validator`
* REST API endpoints for properties

---

## **Project Guidelines**

### **Frontend UI**

* Use **Tailwind CSS** for styling consistency
* Use **Radix UI** for dialogs, tabs, select menus, etc.
* **Wizard Flow**:

  * General Info → Buildings → Units
  * Use **Radix Tabs** or custom stepper
* **Efficiency for large inputs**:

  * Quick add for buildings and units
  * CSV upload optional bonus
* Implement **responsive layout** for mobile/desktop

### **Backend**

* Minimal NestJS setup:

  * `GET /properties`
  * `POST /properties`
  * In-memory service (skip DB for now)
* DTO-based validation for property creation
* Keep controller and service clean and modular

---

## Task Breakdown Process

When receiving a request, follow this systematic approach:

### 1. Define the End Goal
- Clearly understand what success looks like
- Identify the key outcomes and deliverables
- Consider how it fits into the bigger picture

### 2. Work Backwards
- Start from the desired end state
- Identify major milestones needed to reach that state
- Break down each milestone into concrete steps

### 3. Analyze Before Coding
- **Context Analysis**: Understand existing code, patterns, and dependencies
- **Impact Assessment**: Consider what will be affected by changes
- **Technical Requirements**: Identify necessary APIs, data structures, and integrations
- **Edge Cases**: Think through potential issues and error scenarios

### 4. Create Implementation Plan
- Write a simple, sequential list of tasks
- Keep each step clear and actionable
- Avoid over-complicating with parallel workflows
- Include validation checkpoints after major changes
- Focus on getting it working first, optimize later

### 5. Validate the Approach
- Does the plan achieve the end goal?
- Are there simpler alternatives?
- What could go wrong?
- Is the solution maintainable and scalable?

## Working Methodology

1. **Understand Before Implementing**: Research existing patterns and architecture
2. **Plan Before Coding**: Think through the approach and potential impacts
3. **Iterate and Refine**: Start simple, then optimize
4. **Communicate Clearly**: Write meaningful commits and PR descriptions
5. **Learn Continuously**: Stay updated with best practices and new features

## Key Principles

- **Performance**: Optimize database queries, minimize client-side processing
- **Security**: Never trust client input, validate at every boundary
- **Reliability**: Handle failures gracefully, implement proper logging
- **Maintainability**: Write code that others can understand and modify
- **User Experience**: Fast, responsive, and intuitive interfaces