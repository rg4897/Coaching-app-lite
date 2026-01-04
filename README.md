# Coaching Tutorial Management System 🎓

A comprehensive **Next.js** application designed to streamline the management of coaching institutes and tuition centers. This system provides tools for managing students, tracking payments, generating invoices, and analyzing financial data - all stored locally in your browser using localStorage.

## ✨ Features

### 👨‍🎓 Student Management
- Complete student registration and profile management
- Student enrollment tracking with grade-based organization
- Student status management (active/inactive)
- Search and filter students by name, grade, status, and payment status
- Student detail view with fee assignments and payment history
- Bulk fee assignment to multiple students
- CSV export of student data

### 💰 Fee & Payment Management
- **Fee Templates**: Create reusable fee templates with categories (tuition, exam, transport, misc)
- **Fee Frequency Options**: One-time, monthly, term, annual, or custom frequencies
- **Payment Recording**: Record payments with multiple payment methods (cash, card, bank transfer, check, etc.)
- **Payment Application**: Apply payments to specific fee lines with automatic balance calculation
- **Payment History**: Complete payment tracking with date filtering (today, week, month, year)
- **Outstanding Balance Tracking**: Real-time calculation of outstanding balances per student
- **Payment Status**: Visual indicators for paid, partial, and unpaid statuses

### 📄 Invoice Generation
- **Individual Invoices**: Generate invoices for single students in PDF or HTML format
- **Bulk Invoice Generation**: Generate invoices for multiple students at once
- **Automatic Invoice Numbering**: Auto-generated invoice numbers with customizable prefix
- **Professional Invoice Layout**: Includes student details, fee breakdown, payment history, and outstanding balance
- **Multiple Export Formats**: PDF for printing or HTML for digital distribution

### 📊 Dashboard & Analytics
- **Key Performance Indicators**: Total students, collections, outstanding amounts, and overdue counts
- **Financial Metrics**: Collection rate, average fee per student, monthly growth tracking
- **Interactive Charts**:
  - Collection trend chart (monthly payment trends)
  - Fee category breakdown
  - Collection by grade analysis
  - Outstanding balances by grade
- **Recent Activity Feed**: Latest payment transactions
- **Key Insights**: Payment method distribution, grade distribution, collection efficiency metrics

### 📈 Reports & Data Management
- **CSV Exports**:
  - Students report with complete information
  - Payment transactions (with date range filtering)
  - Outstanding balances report
  - Fee templates report
- **Data Backup & Restore**:
  - Full backup to JSON format
  - Restore from backup file
  - Complete data migration support
- **Data Statistics**: View data size and record counts

### ⚙️ Settings & Configuration
- **School/Institute Configuration**: School name, logo upload, academic year settings
- **Invoice Settings**: Customizable invoice prefix and numbering sequence
- **Payment Methods**: Customizable list of accepted payment methods
- **Fee Categories**: Manage fee category options
- **Frequency Options**: Customize fee frequency options
- **Grade Options**: Configure available grade levels
- **Regional Settings**: Currency, date format, language, timezone
- **User Management**: Create and manage admin and user accounts
- **Theme Support**: Light/dark theme toggle

### 🔐 Authentication & Security
- **User Authentication**: Secure login system with role-based access
- **User Roles**: Admin and user roles with different permission levels
- **Default Admin Account**: Pre-configured admin user for initial setup

### 📱 User Experience
- **Responsive Design**: Fully responsive layout for desktop, tablet, and mobile devices
- **Modern UI**: Built with Shadcn UI components for a polished interface
- **Dark Mode**: Theme switching support
- **Real-time Updates**: Live data updates without page refresh
- **Pagination**: Efficient data pagination for large datasets
- **Advanced Filtering**: Multiple filter options for all data views

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe development

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Shadcn UI** - High-quality component library built on Radix UI
- **Lucide React** - Icon library
- **next-themes** - Theme management

### Forms & Validation
- **React Hook Form** - Performant form library
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Data Visualization
- **Recharts** - Composable charting library for React

### Data Storage
- **localStorage** - Browser-based data persistence (no backend required)

### Utilities
- **date-fns** - Date manipulation and formatting
- **class-variance-authority** - Component variant management
- **cmdk** - Command menu component

### Build & Deployment
- **Next.js Static Export** - Generates static HTML for easy deployment
- **Netlify** - Deployment configuration included

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/rg4897/Coaching-app-lite.git
cd Coaching-app-lite
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production
```bash
npm run build
```

This generates a static export in the `out/` directory that can be deployed to any static hosting service.

### 5. Export Static Site
```bash
npm run export
```

## 🔐 Default Login Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`

> **Note:** Please change these credentials after first login! You can manage users in the Settings page.

## 📁 Project Structure

```
Coaching-app-lite/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth layout group
│   ├── dashboard/           # Dashboard layout
│   ├── students/            # Student management pages
│   ├── fees/                # Fee templates page
│   ├── payments/            # Payment tracking page
│   ├── invoices/            # Invoice generation page
│   ├── reports/             # Reports & data management
│   ├── settings/            # Settings & configuration
│   └── login/               # Login page
├── components/              # React components
│   ├── charts/             # Chart components
│   ├── dialogs/            # Dialog components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   └── ui/                 # Shadcn UI components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
├── types/                   # TypeScript type definitions
├── utils/                   # Helper functions
│   ├── calculations.ts     # Financial calculations
│   ├── csv-export.ts       # CSV export utilities
│   ├── currency.ts         # Currency formatting
│   ├── date.ts             # Date formatting
│   ├── invoice-number.ts   # Invoice number generation
│   ├── pdf-generator.tsx   # PDF/HTML invoice generation
│   └── uuid.ts             # UUID generation
├── public/                  # Static assets
└── out/                     # Static export output (generated)
```

## 💾 Data Storage

This application uses **localStorage** for data persistence, which means:
- ✅ No backend server required
- ✅ Data is stored locally in your browser
- ✅ Works offline after initial load
- ✅ Easy backup and restore functionality
- ⚠️ Data is specific to the browser and device
- ⚠️ Clearing browser data will remove all records

### Data Backup
Always create regular backups using the Backup feature in the Reports page to prevent data loss.

## 🎯 Key Features Explained

### Fee Management Workflow
1. **Create Fee Templates**: Define reusable fee structures (e.g., "Monthly Tuition - Grade 10")
2. **Assign to Students**: Assign fees to individual students or bulk assign to multiple students
3. **Record Payments**: Enter payments and apply them to specific fee lines
4. **Track Balances**: System automatically calculates outstanding amounts
5. **Generate Invoices**: Create professional invoices for students

### Payment Application
Payments can be applied to:
- Single fee line (full or partial payment)
- Multiple fee lines (split payment)
- System automatically updates fee status (open, partial, paid, overdue)

### Invoice System
- Automatic invoice number generation (customizable format)
- Includes all assigned fees, payment history, and outstanding balance
- Export as PDF for printing or HTML for email/distribution

## 🌐 Deployment

This application is configured for static site generation and can be deployed to:

- **Netlify** (configuration included in `netlify.toml`)
- **Vercel**
- **GitHub Pages**
- Any static hosting service

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy the `out/` directory to Netlify
3. Or connect your repository for automatic deployments

## 🤝 Contributing

For contribution guidelines, please refer to [CONTRIBUTING.md](CONTRIBUTING.md).

When contributing:
1. Create an issue before starting work
2. Use the branch naming convention: `feature/CAL-{issue-id}-{description}`
3. Follow the existing code style and structure
4. Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/rg4897/Coaching-app-lite/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about the problem, including:
   - Browser and version
   - Steps to reproduce
   - Expected vs. actual behavior

## 🚧 Known Limitations

- Data is stored in browser localStorage (limited to ~5-10MB)
- No multi-device synchronization
- No cloud backup (manual backup required)
- No email notifications
- Static export means no server-side features

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Recharts](https://recharts.org/) - Charting library
- [Radix UI](https://www.radix-ui.com/) - Unstyled UI components

---

**Made with ❤️ by [GrowFast Techno Solutions](https://github.com/GrowFast-Techno-Solutions)**