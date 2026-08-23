# Quotation & Invoice Platform — Future Phases Backlog Plan

## Purpose

This backlog covers the product roadmap **after MVP completion**.

The MVP establishes the core workflow:

> Organization → Client → Quotation → Project → Work Tracking → Invoice → Payment (manual)

The future roadmap should focus on increasing automation, improving client payment experience, supporting agencies, and adding India-specific and international capabilities without turning the product into a full ERP too early.

---

# Product Evolution Strategy

The recommended progression is:

```text
MVP
  ↓
Billing Automation
  ↓
Client Payment Experience
  ↓
Agency Collaboration
  ↓
India Compliance & Integrations
  ↓
Advanced Analytics
  ↓
Platform & Ecosystem
```

Each phase should be validated using actual user feedback and product usage before moving to the next phase.

---

# Phase 2 — Billing Automation

## Goal

Reduce manual work after an invoice or project is created.

## Primary Outcome

Users should be able to create billing schedules once and let the platform handle recurring invoice generation and payment follow-ups.

---

## Epic 2.1 — Recurring Invoices

### User stories

- As a freelancer, I want to automatically generate monthly retainer invoices.
- As an agency, I want recurring invoices for maintenance contracts.
- As a user, I want to pause or resume recurring billing.

### Features

- Create recurring schedule
- Monthly frequency
- Weekly frequency
- Quarterly frequency
- Yearly frequency
- Custom interval
- Start date
- End date
- No end date
- Automatic invoice generation
- Automatic email sending
- Manual review before sending
- Pause schedule
- Resume schedule
- Duplicate schedule
- Recurring schedule history

### Backlog

- [ ] Create recurring invoice data model
- [ ] Create recurring invoice schedule UI
- [ ] Support monthly frequency
- [ ] Support weekly frequency
- [ ] Support quarterly frequency
- [ ] Support yearly frequency
- [ ] Add custom interval support
- [ ] Build recurring invoice background worker
- [ ] Generate invoice from schedule
- [ ] Support automatic invoice sending
- [ ] Support draft-before-send mode
- [ ] Add pause functionality
- [ ] Add resume functionality
- [ ] Add schedule end date
- [ ] Add recurring invoice history
- [ ] Add failure handling and retries
- [ ] Add recurring job monitoring

---

## Epic 2.2 — Automated Payment Reminders

### Goal

Automatically follow up on unpaid invoices.

### Reminder rules

Default sequence:

```text
3 days before due date
On due date
3 days overdue
7 days overdue
14 days overdue
```

### Backlog

- [ ] Create reminder rule configuration
- [ ] Add pre-due reminders
- [ ] Add due-date reminders
- [ ] Add overdue reminders
- [ ] Build reminder background job
- [ ] Add email reminder templates
- [ ] Add reminder history
- [ ] Automatically stop reminders after payment
- [ ] Allow reminder schedule customization
- [ ] Allow manual reminder sending
- [ ] Add reminder failure logging
- [ ] Add retry mechanism

---

## Epic 2.3 — Invoice Automation Rules

### Features

- Automatically create invoices from milestones
- Automatically create invoice drafts before milestone dates
- Automatically send approved invoices
- Automatic overdue status
- Automatic recurring invoice creation

### Backlog

- [ ] Create automation rules model
- [ ] Add milestone trigger rules
- [ ] Add date trigger rules
- [ ] Add invoice draft automation
- [ ] Add invoice send automation
- [ ] Add automation activity logs
- [ ] Add automation enable/disable controls

---

# Phase 3 — Client Approval and Payment Experience

## Goal

Create a premium client-facing experience.

---

## Epic 3.1 — Enhanced Quotation Approval

### Features

- Online acceptance
- Digital acknowledgement
- Comments
- Change requests
- Approval audit history

### Backlog

- [ ] Add accept quotation action
- [ ] Add reject quotation action
- [ ] Add request changes action
- [ ] Add client comments
- [ ] Add approval timestamp
- [ ] Add approval audit trail
- [ ] Add client name confirmation
- [ ] Add approval notification email
- [ ] Add internal notification
- [ ] Add quotation revision workflow

---

## Epic 3.2 — Payment Gateway Integration

The MVP ships with manual payment tracking only (client pays externally,
the user records it — see product-plan.md section 8/9 and build-plan.md
section 14). This epic is where that graduates to the client paying
inline through a generated link, with the gateway webhook auto-recording
the payment. `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` /
`RAZORPAY_WEBHOOK_SECRET` are already scaffolded (empty) in `.env.example`,
waiting on this phase.

### Initial provider

Razorpay should be the first integration.

### Features

- Create payment link
- Embed payment button
- Payment success handling
- Payment failure handling
- Webhook processing
- Automatic invoice reconciliation

### Backlog

- [ ] Create payment provider abstraction
- [ ] Implement Razorpay integration
- [ ] Generate payment link per invoice
- [ ] Add payment link to public invoice page
- [ ] Process payment success webhook
- [ ] Process payment failure webhook
- [ ] Verify webhook signatures
- [ ] Automatically create payment record
- [ ] Automatically update invoice status
- [ ] Add payment transaction log
- [ ] Add webhook retry handling

---

## Epic 3.3 — UPI and Payment Instructions

### Features

- UPI ID display
- UPI QR code
- Bank transfer instructions
- Payment reference guidance

### Backlog

- [ ] Store UPI payment details
- [ ] Generate UPI payment QR code
- [ ] Add UPI payment section to invoice
- [ ] Add bank transfer section
- [ ] Add copy payment reference action
- [ ] Add payment instruction templates

---

## Epic 3.4 — Client Portal

### Goal

Allow clients to view all documents in one secure location.

### Features

- Client document history
- Quotations
- Invoices
- Payment history
- Outstanding balance

### Backlog

- [ ] Design client portal authentication strategy
- [ ] Create client access tokens
- [ ] Create client dashboard
- [ ] Show quotations
- [ ] Show invoices
- [ ] Show payment history
- [ ] Show outstanding amount
- [ ] Add document download
- [ ] Add payment action
- [ ] Add security and token expiration

---

# Phase 4 — Project and Milestone Management

## Goal

Strengthen the product for software agencies.

---

## Epic 4.1 — Advanced Milestone Billing

### Features

- Milestone schedules
- Percentage-based milestones
- Fixed-value milestones
- Due dates
- Automatic invoice generation

### Backlog

- [ ] Add percentage-based milestones
- [ ] Add fixed-value milestones
- [ ] Validate milestone total against contract value
- [ ] Add milestone due dates
- [ ] Add milestone completion status
- [ ] Add invoice milestone action
- [ ] Track milestone invoiced amount
- [ ] Track milestone paid amount
- [ ] Show remaining milestone amount
- [ ] Add milestone payment timeline

---

## Epic 4.2 — Project Financial Overview

### Metrics

- Contract value
- Total invoiced
- Total paid
- Outstanding
- Remaining to invoice

### Backlog

- [ ] Build project financial calculations
- [ ] Create project finance summary UI
- [ ] Add invoice timeline
- [ ] Add payment timeline
- [ ] Add milestone financial progress
- [ ] Add contract utilization percentage

---

## Epic 4.3 — Advanced Work Management

The MVP ships lightweight, project-scoped work items (title, status,
priority, due date — see product-plan.md section 6.7 and
build-plan.md section 4.14) deliberately kept simple: one flat list per
project, no boards, no relationships. This epic is where it grows into
something closer to a full work-tracking feature, once real usage
justifies the extra complexity — see the "Recommended Product Rule" at
the end of this document before building any of it.

### Features

- Kanban board view (drag-and-drop between status columns)
- Manual drag-and-drop ordering within a column
- Subtasks / checklists on a work item
- Work item ↔ milestone relationships (e.g. a milestone auto-completes or
  is blocked by its linked work items)
- Time tracking (estimated vs. actual hours)
- Team assignment on a work item (depends on Epic 5.1 — Team Members)
- A standalone top-level "My Work" view across all projects, not just the
  per-project dashboard tile
- Automated progress suggestions (e.g. "this project is behind its usual
  pace")
- Optional: generate initial work items from quotation deliverables when
  converting a quotation to a project

### Backlog

- [ ] Validate demand before building any of the above (see product rule)
- [ ] Kanban board UI with drag-and-drop status changes
- [ ] Persist manual sort order via drag-and-drop
- [ ] Subtask data model and UI
- [ ] Work item ↔ milestone linking model
- [ ] Time tracking fields and reporting
- [ ] Work item assignee field (requires Epic 5.1 roles/members)
- [ ] Standalone "My Work" cross-project view
- [ ] Quotation-deliverable → work-item generation on project creation

---

# Phase 5 — Agency Collaboration

## Goal

Support growing agencies with teams.

---

## Epic 5.1 — Team Members

### Roles

- Owner
- Admin
- Finance
- Project Manager
- Member
- Viewer

### Backlog

- [ ] Create organization member invitation
- [ ] Create role model
- [ ] Add member management page
- [ ] Add invitation email
- [ ] Add member removal
- [ ] Add role updates

---

## Epic 5.2 — Role-Based Access Control

### Backlog

- [ ] Define permission matrix
- [ ] Implement authorization middleware
- [ ] Protect API resources
- [ ] Hide unauthorized UI actions
- [ ] Add custom permission support
- [ ] Add permission audit logs

---

## Epic 5.3 — Approval Workflows

### Use cases

- Invoice approval before sending
- Discount approval
- Large invoice approval

### Backlog

- [ ] Create approval workflow model
- [ ] Add invoice approval status
- [ ] Add approve/reject action
- [ ] Add approval notifications
- [ ] Add approval history
- [ ] Add approval thresholds

---

# Phase 6 — Reporting and Analytics

## Goal

Help users understand cash flow and business performance.

---

## Epic 6.1 — Revenue Dashboard

### Metrics

- Monthly revenue
- Paid revenue
- Outstanding revenue
- Overdue revenue
- Average invoice value

### Backlog

- [ ] Create reporting API
- [ ] Add date range filters
- [ ] Add revenue summary
- [ ] Add monthly revenue chart
- [ ] Add payment collection chart
- [ ] Add outstanding breakdown
- [ ] Add overdue breakdown

---

## Epic 6.2 — Client Analytics

### Features

- Top clients
- Revenue per client
- Outstanding by client
- Payment behavior

### Backlog

- [ ] Calculate client lifetime value
- [ ] Calculate average payment time
- [ ] Identify top clients
- [ ] Show client outstanding
- [ ] Show client payment history
- [ ] Add client revenue reports

---

## Epic 6.3 — Cash Flow Forecasting

### Features

- Expected payment forecast
- Upcoming recurring revenue
- Scheduled invoices
- Overdue risk

### Backlog

- [ ] Build expected payment forecast
- [ ] Include invoice due dates
- [ ] Include recurring invoices
- [ ] Add confidence indicators
- [ ] Create future cash flow chart

---

# Phase 7 — India-Specific Financial Features

## Goal

Improve fit for Indian businesses while keeping compliance scope manageable.

---

## Epic 7.1 — GST Enhancements

### Backlog

- [ ] Improve GST calculation engine
- [ ] Support place-of-supply configuration
- [ ] Improve CGST/SGST handling
- [ ] Improve IGST handling
- [ ] Add GST summary reports
- [ ] Add GST export files

---

## Epic 7.2 — TDS Support

### Backlog

- [ ] Add TDS configuration
- [ ] Add TDS deduction calculation
- [ ] Show gross invoice amount
- [ ] Show TDS deduction
- [ ] Track net payment received
- [ ] Add TDS reports

---

## Epic 7.3 — Credit Notes

### Backlog

- [ ] Create credit note data model
- [ ] Create credit note UI
- [ ] Link credit notes to invoices
- [ ] Track credited amount
- [ ] Update outstanding balance
- [ ] Generate credit note PDF

---

## Epic 7.4 — E-Invoicing

This should only be built after validating demand and applicable regulatory requirements.

### Backlog

- [ ] Research current e-invoice requirements
- [ ] Identify eligible customer segment
- [ ] Select integration provider
- [ ] Implement IRN generation
- [ ] Add QR code support
- [ ] Handle e-invoice status
- [ ] Handle cancellations

---

# Phase 8 — Communication Integrations

## Epic 8.1 — WhatsApp

### Use cases

- Send quotation
- Send invoice
- Send payment reminder
- Payment confirmation

### Backlog

- [ ] Select WhatsApp provider
- [ ] Implement template management
- [ ] Send invoice message
- [ ] Send quotation message
- [ ] Send reminder message
- [ ] Log delivery status
- [ ] Add WhatsApp opt-in settings

---

## Epic 8.2 — Email Customization

### Backlog

- [ ] Create email template editor
- [ ] Add organization branding
- [ ] Add custom sender name
- [ ] Add custom reply-to
- [ ] Add reusable email templates
- [ ] Add send preview

---

# Phase 9 — International Business Support

## Goal

Expand from India-first to global service businesses.

---

## Epic 9.1 — Multi-Currency

### Backlog

- [ ] Add supported currency list
- [ ] Add currency per client
- [ ] Add currency per quotation
- [ ] Add currency per invoice
- [ ] Add exchange rate storage
- [ ] Add base currency reporting

---

## Epic 9.2 — International Payments

### Backlog

- [ ] Add Stripe provider
- [ ] Support international cards
- [ ] Handle payment webhooks
- [ ] Add payment fee visibility

---

## Epic 9.3 — Localization

### Backlog

- [ ] Add timezone handling
- [ ] Add localized date formats
- [ ] Add localized number formats
- [ ] Add language framework
- [ ] Translate core interface

---

# Phase 10 — Platform and Ecosystem

## Epic 10.1 — Public API

### Backlog

- [ ] Create API authentication
- [ ] Create API keys
- [ ] Create client APIs
- [ ] Create quotation APIs
- [ ] Create invoice APIs
- [ ] Create payment APIs
- [ ] Add rate limiting
- [ ] Create API documentation
- [ ] Add webhook support

---

## Epic 10.2 — Webhooks

### Events

- quotation.created
- quotation.accepted
- invoice.created
- invoice.sent
- invoice.paid
- invoice.overdue
- payment.received

### Backlog

- [ ] Create webhook endpoint model
- [ ] Add event subscriptions
- [ ] Add delivery worker
- [ ] Add signature verification
- [ ] Add retries
- [ ] Add delivery history

---

## Epic 10.3 — Integrations

Potential integrations:
- Accounting software
- CRM systems
- Project management tools

### Backlog

- [ ] Research highest-demand integrations
- [ ] Build integration framework
- [ ] Add OAuth connection model
- [ ] Add sync jobs
- [ ] Add integration activity logs

---

# Phase 11 — Advanced Intelligence

## Goal

Use AI only where it clearly reduces user effort.

---

## Epic 11.1 — AI Quotation Assistant

### Features

Input:

```text
Build a mobile application for restaurant ordering.
Timeline: 3 months.
Budget: ₹8 lakh.
```

Output:
- Suggested project phases
- Suggested deliverables
- Suggested milestones
- Draft scope
- Draft assumptions

### Backlog

- [ ] Define AI prompt structure
- [ ] Generate scope draft
- [ ] Generate deliverables
- [ ] Generate milestones
- [ ] Generate assumptions
- [ ] Add human review requirement
- [ ] Save AI generation history

---

## Epic 11.2 — Payment Risk Insights

### Potential insights

- Client usually pays 12 days late
- This invoice has high overdue risk
- Outstanding amount is unusually high

### Backlog

- [ ] Define payment behavior metrics
- [ ] Calculate payment delay patterns
- [ ] Add risk indicators
- [ ] Add explanation UI
- [ ] Validate prediction usefulness

---

# Phase 12 — Enterprise Readiness

Build only when customer demand justifies it.

---

## Features

- SSO
- Advanced audit logs
- Data retention policies
- Custom roles
- Multiple organizations
- White-labeling
- Custom domains

### Backlog

- [ ] SSO architecture
- [ ] SAML/OIDC support
- [ ] Enterprise audit logs
- [ ] Data export
- [ ] Data retention settings
- [ ] White-label settings
- [ ] Custom domain routing

---

# Prioritization Framework

Every feature should be evaluated using:

```text
User Demand × Revenue Impact × Strategic Value
----------------------------------------------
Development Complexity × Maintenance Cost
```

Priority levels:

## P0
Required for core product reliability.

## P1
Strong monetization or retention impact.

## P2
Important but not blocking growth.

## P3
Build only after repeated customer demand.

---

# Recommended Release Order

## Release 1 — MVP
- Quotations
- Projects
- Work items
- Invoices
- Payments (manual tracking)
- PDFs

## Release 2 — Automation
- Recurring invoices
- Payment reminders
- Quote approval

## Release 3 — Payments
- Razorpay
- UPI
- Client portal

## Release 4 — Agency
- Milestones
- Teams
- Roles
- Advanced work management (Kanban, subtasks, assignees — Epic 4.3)

## Release 5 — Intelligence
- Reports
- Analytics
- Cash flow

## Release 6 — India Expansion
- TDS
- Credit notes
- Advanced GST

## Release 7 — Ecosystem
- API
- Webhooks
- Integrations

## Release 8 — Global
- Multi-currency
- International payments
- Localization

## Release 9 — Intelligence
- AI quotation assistant
- Payment insights

## Release 10 — Enterprise
- SSO
- White-label
- Enterprise controls

---

# Future Product Success Metrics

Track these after MVP:

## Automation
- Percentage of recurring invoices generated automatically
- Reminder-to-payment conversion
- Reduction in manual invoicing actions

## Payments
- Invoice payment conversion
- Average days to payment
- Percentage paid through payment links

## Retention
- Weekly active organizations
- Monthly active organizations
- Invoice retention rate
- Recurring revenue

## Growth
- Free-to-paid conversion
- Average revenue per organization
- Expansion from freelancer to agency plan

---

# Recommended Product Rule

Do not build a future feature simply because competitors have it.

Before adding any feature, ask:

1. Does it improve the quotation-to-payment workflow?
2. Does it solve a repeated customer problem?
3. Will a meaningful number of customers pay for it?
4. Can it be maintained without adding major product complexity?

If the answer is mostly no, deprioritize it.

---

# Final Strategic Direction

The long-term product should evolve from:

> Invoice generator

into:

> Commercial operations platform for software service businesses.

The product's strongest long-term loop is:

```text
Win Work
  ↓
Create Proposal
  ↓
Get Approval
  ↓
Manage Contract Value
  ↓
Bill Automatically
  ↓
Collect Payment
  ↓
Understand Revenue
```

That gives the product a clear expansion path while maintaining a focused identity.
