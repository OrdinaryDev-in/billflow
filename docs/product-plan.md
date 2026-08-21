# Product Plan — Quotation & Invoice Platform for Indian Software Businesses

## 1. Product Vision

Build a focused SaaS platform that helps Indian software freelancers, consultants and small agencies:

**Create a quotation → get client approval → manage project value → generate milestone/recurring invoices → collect payments → track outstanding balances.**

### Product positioning

> The easiest way for Indian software professionals to quote, bill and get paid.

The product should **not** begin as a generic accounting or ERP platform. Its primary advantage is a workflow designed around software services and project billing.

---

## 2. Target Users

### Freelancers
- Software developers
- UI/UX designers
- Consultants
- Digital marketers
- Other service professionals

### Small software agencies
- 2–30 team members
- Web and mobile development agencies
- IT consulting companies
- Product development studios

### Independent consultants
- Technical consultants
- Fractional CTOs
- Product consultants
- Development contractors

---

## 3. Core Problems

Users commonly need to:
- Create professional quotations quickly
- Reuse service and project templates
- Convert approved quotations into invoices
- Collect advances and milestone payments
- Track partial payments
- Handle recurring retainers
- Generate branded GST/non-GST PDFs
- Know which invoices are overdue
- Follow up without manual effort

---

## 4. Core Product Workflow

```text
Client
  ↓
Create Quotation / Proposal
  ↓
Send Client Link + PDF
  ↓
Client Views
  ↓
Accept / Reject / Request Changes
  ↓
Create Project
  ↓
Configure Billing Plan
  ↓
Advance / Milestone / Full / Recurring Invoice
  ↓
Send Payment Link
  ↓
Track Payment
  ↓
Automatic Reminders
  ↓
Paid / Overdue
```

---

## 5. Product Principles

1. Simple enough for a freelancer
2. Powerful enough for a small agency
3. No accounting jargon unless required
4. Project billing is a first-class concept
5. Every document should be shareable through a secure client link
6. Payment status should update automatically when possible
7. GST support should be accurate and configurable
8. Mobile responsiveness is mandatory
9. PDFs should look premium by default
10. Core workflows should require minimal setup

---

## 6. MVP Feature Set

### 6.1 Authentication and organization setup
- Email/password authentication
- Google login
- Create organization
- Business profile
- Logo upload
- GST registered/non-GST mode
- PAN/GSTIN
- Address
- Bank details
- UPI ID
- Invoice and quotation numbering
- Default payment terms

### 6.2 Clients
- Create/edit/archive client
- Company or individual
- Contact details
- GSTIN
- Billing address
- Client history
- Outstanding amount
- Linked projects
- Linked quotations and invoices

### 6.3 Quotations
- Draft quotations
- Numbering
- Line items
- Sections
- Tax
- Discounts
- Validity date
- Notes
- Payment terms
- Scope of work
- Deliverables
- Timeline
- Assumptions
- Exclusions
- Versioning
- Duplicate quotation
- Branded PDF
- Public client link

### 6.4 Quotation templates
Initial templates:
- Website development
- Mobile app development
- UI/UX design
- Software maintenance
- Monthly development retainer
- Consulting

### 6.5 Approval workflow
Client actions:
- View
- Download PDF
- Accept
- Reject
- Request changes

Store:
- Action timestamp
- Optional client message
- Approval audit trail

### 6.6 Projects
Projects are created manually or from approved quotations.

Track:
- Project value
- Invoiced value
- Paid value
- Outstanding value
- Remaining value
- Billing type
- Linked milestones

### 6.7 Invoices
- Draft
- Send
- Mark paid
- Partial payments
- Due dates
- GST/non-GST
- CGST/SGST/IGST
- Discounts
- Notes
- Terms
- PO number
- Branded PDF
- Client payment page

Statuses:
- Draft
- Sent
- Viewed
- Partially paid
- Paid
- Overdue
- Cancelled

### 6.8 Payment tracking
- Manual payments
- Partial payments
- Payment method
- Payment reference
- Payment date
- Automatic balance calculation

### 6.9 Recurring invoices
Support:
- Weekly
- Monthly
- Quarterly
- Yearly

Use cases:
- Retainers
- Maintenance
- AMC
- Dedicated developer contracts

### 6.10 Email sending
- Send quotation
- Send invoice
- Send reminder
- Delivery history
- Open/view tracking where feasible

### 6.11 Dashboard
Show:
- Outstanding amount
- Overdue amount
- Paid this month
- Invoice pipeline
- Upcoming recurring invoices
- Recent activity

---

## 7. Key Differentiator: Software Project Billing

### Milestone example

| Milestone | Value | Status |
|---|---:|---|
| Discovery | ₹50,000 | Paid |
| Design | ₹100,000 | Paid |
| Development | ₹250,000 | Partially paid |
| Deployment | ₹100,000 | Not invoiced |

The user should be able to generate an invoice directly from an unpaid milestone.

---

## 8. Payment Collection Strategy

Initial payment methods:
- Bank transfer
- UPI
- Razorpay payment link
- Cash/manual
- Other

Later:
- Cashfree
- Stripe for international clients
- Additional gateways

---

## 9. Automated Reminders

Default reminder policy:
- 3 days before due date
- On due date
- 3 days overdue
- 7 days overdue
- 14 days overdue

Channels:
1. Email first
2. WhatsApp later

Reminders should stop automatically when an invoice is fully paid.

---

## 10. Features to Avoid Initially

Do not build in the MVP:
- Full bookkeeping
- Inventory
- Purchase orders
- Payroll
- Complete CRM
- Expense accounting
- ERP
- Advanced accountant workflows
- Tally synchronization

---

## 11. Suggested Pricing

### Free
- Limited clients
- Limited monthly invoices
- Basic PDFs

### Freelancer
- Unlimited invoices
- Quotations
- Branded documents
- Payment tracking
- Recurring invoices

### Professional
- Automated reminders
- Payment links
- Milestones
- Client portal
- Advanced branding

### Agency
- Multiple users
- Roles
- Multiple business units
- Advanced reports
- API/webhooks

---

## 12. Success Metrics

Track:
- Organizations created
- Quotations created
- Quotes sent
- Quote approval rate
- Invoices created
- Invoice payment rate
- Average days to payment
- Overdue invoice rate
- Monthly active organizations
- Free-to-paid conversion
- Recurring revenue
