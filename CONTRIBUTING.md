# Contributing Guidelines – Coaching Management Project

## 1. Getting Started

### Clone the Repository/ Inital Project Setup

1. **Clone the Project** to your local machine:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   ```

2. **Always sync the project before starting new work:**
   ```bash
   git checkout main
   git pull main
   ```

---

## 2. Issue Creation Workflow

Before starting any task, **you must create an issue** in the repository. This helps in tracking progress, enabling collaboration, and maintaining transparency in the development process.

### Steps to Create an Issue

1. **Go to the GitHub repository's Issues tab:**

   * [https://github.com/<your-username>/<repo-name>/issues](https://github.com/<your-username>/<repo-name>/issues)

2. **Click on** `New Issue`.

3. **Select an appropriate issue template**, if available (e.g., *Feature Request*, *Bug Report*, etc.).

4. **Fill in the following details** in the issue:

   * **Title**: Use a clear, concise title (e.g., `CAL-21: Implement Student Feedback Form`)
   * **Description**: Provide a detailed explanation of the task. Include:

     * Purpose of the task
     * Acceptance criteria or deliverables
     * Mockups or links (if available)
   * **Labels**: Assign the relevant labels (`feature`, `bug`, `enhancement`, etc.)
   * **Assignee**: Assign the issue to **yourself** or the person responsible for the task.
   * **Project/Milestone**: Link to the appropriate project board or sprint milestone if used.

5. **Submit the issue.**

6. Once the issue is created, **use the issue number in your branch name** and link it in your PR:

   * Branch name: `feature/CAL-21-feedback-form`
   * PR description:

     ```
     Fixes #21
     ```

> ⚠️ **Note:** Do **not** start development without creating an issue and getting it reviewed (if required). This ensures visibility and avoids duplicate efforts.


---

## 3. Branching Workflow

We use a feature branch workflow with a protected main branch. We use hybrid branch naming convention to create any new branch.

### Branch Naming Conventions

- `feature/<app-initials>-<issue-id><short-description>` → New feature (e.g., `feature/CAL-1-student-registration`)
- `bugfix/<app-initials>-<issue-id><short-description>` → Bug fix (e.g., `bugfix/CAL-1-login-error`)
- `hotfix/<app-initials>-<issue-id><short-description>` → Urgent production fix

### Example
```bash
git checkout -b feature/CAL-11-payment-page
```

---

## 4. Submitting Changes

1. **Work on your own feature branch.**

2. **Run build tests before committing:**
   ```bash
   npm run build
   ```

3. **Push your branch to your fork:**
   ```bash
   git push origin feature/CAL-11-payment-page
   ```

4. **Open a Pull Request (PR)** to the main branch of the main repository.

5. **In your PR description, link related issues using:**
   ```
   Fixes #<issue-number>
   ```

---

## 5. Code Review

- At least **1 approval** is required before merging.
- Keep PRs **small and focused** (≤ 300 lines of change is preferred).
- Address review comments promptly.

---

## 6. Project Setup (Local Development)

### Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Run build script:**
   ```bash
   npm run build
   ```

---

## 7. Code Style

### General Guidelines
- Use **functional components** and **React hooks** for frontend.
- Keep functions **short and well-documented**.

### Component Architecture
We follow **Atomic Design methodology** for organizing and building components:

- **Elements** → Basic building blocks (buttons, inputs, labels)
  ```
  src/components/elements/Button/
  src/components/elements/Input/
  ```

- **Modules** → Groups of elements (search bar, form field)
  ```
  src/components/modules/SearchBar/
  src/components/modules/FormField/
  ```

- **Components** → Complex UI sections (header, sidebar, data table)
  ```
  src/components/components/Header/
  src/components/components/StudentTable/
  ```

- **Pages** → Complete views with real content
  ```
  src/pages/Dashboard/
  src/pages/StudentManagement/
  ```


### Component Guidelines as per Our Project
- **Elements(Atoms)**: Single responsibility, highly reusable
- **Modules(Molecules)**: Combine atoms, handle simple interactions
- **Components(Organisms)**: Complex functionality, business logic
- **Pages**: Connect to data sources and routing

---

Thank you for your contribution! 🎉
