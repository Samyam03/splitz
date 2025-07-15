import { internalMutation, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Action to send emails via Resend
export const sendEmailAction = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, { to, subject, html }) => {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        console.error('RESEND_API_KEY is not set');
        return { success: false, error: 'RESEND_API_KEY not configured' };
      }
      
      // Use fetch to call Resend API directly
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Splitz <onboarding@resend.dev>',
          to: [to],
          subject: subject,
          html: html,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Resend API error:', response.status, errorData);
        return { success: false, error: `Resend API error: ${response.status} - ${errorData}` };
      }
      
      const result = await response.json();
      return { success: true, result };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  },
});

// Shared email styles
const getEmailStyles = () => `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
    line-height: 1.6; 
    color: #1f2937; 
    background-color: #f9fafb;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .email-container { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .header { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    color: white; 
    padding: 48px 32px; 
    text-align: center; 
    position: relative;
  }
  .header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
  .header h1 { 
    font-size: 32px; 
    font-weight: 700; 
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
    line-height: 1.2;
    letter-spacing: -0.025em;
  }
  .header p { 
    font-size: 18px; 
    opacity: 0.95;
    position: relative;
    z-index: 1;
    line-height: 1.4;
    font-weight: 400;
  }
  .content { 
    padding: 48px 32px; 
    background: #ffffff;
  }
  .main-card { 
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 16px; 
    padding: 40px; 
    margin-bottom: 40px; 
    border: 1px solid #e2e8f0;
    position: relative;
    overflow: hidden;
  }
  .main-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
  .amount { 
    font-size: 42px; 
    font-weight: 800; 
    color: #1e293b; 
    text-align: center;
    margin: 32px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
  .description {
    font-size: 28px;
    font-weight: 600;
    color: #1e293b;
    text-align: center;
    margin-bottom: 32px;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .details { 
    background: #ffffff;
    border-radius: 12px;
    padding: 32px;
    margin: 32px 0;
    border: 1px solid #e2e8f0;
  }
  .detail-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
    line-height: 1.5;
  }
  .detail-row:last-child {
    border-bottom: none;
  }
  .detail-row:first-child {
    padding-top: 0;
  }
  .label { 
    font-weight: 600; 
    color: #64748b; 
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.75px;
    line-height: 1.4;
  }
  .value { 
    color: #1e293b; 
    font-weight: 500;
    font-size: 16px;
    line-height: 1.5;
    text-align: right;
    max-width: 60%;
  }
  .footer { 
    text-align: center; 
    margin-top: 48px; 
    color: #64748b; 
    font-size: 14px;
    padding: 32px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    line-height: 1.6;
  }
  .footer p {
    margin-bottom: 12px;
  }
  .footer p:last-child {
    margin-bottom: 0;
  }
  .button { 
    display: inline-block; 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white; 
    padding: 18px 36px; 
    text-decoration: none; 
    border-radius: 12px; 
    margin-top: 32px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
    line-height: 1.4;
    letter-spacing: 0.025em;
  }
  .button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(102, 126, 234, 0.4);
  }
  .icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin-right: 8px;
    vertical-align: middle;
  }
  .status-badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 24px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.75px;
    margin-top: 24px;
    line-height: 1.2;
  }
  .status-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }
  .status-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }
  .status-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
  }
  .participants-section {
    background: #ffffff;
    border-radius: 12px;
    padding: 28px;
    margin: 32px 0;
    border: 1px solid #e2e8f0;
  }
  .participants-title {
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 0.75px;
    line-height: 1.4;
  }
  .participant-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
    line-height: 1.5;
  }
  .participant-item:last-child {
    border-bottom: none;
  }
  .participant-item:first-child {
    padding-top: 0;
  }
  .participant-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
    margin-right: 16px;
    flex-shrink: 0;
  }
  .participant-name {
    font-weight: 500;
    color: #1e293b;
    font-size: 16px;
    line-height: 1.4;
  }
  .message-text {
    text-align: center;
    color: #64748b;
    margin: 32px 0;
    line-height: 1.7;
    font-size: 16px;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }
  .footer-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }
  .footer-link:hover {
    text-decoration: underline;
  }
  .footer-note {
    margin-top: 12px;
    font-size: 12px;
    opacity: 0.7;
    line-height: 1.5;
  }
  @media only screen and (max-width: 600px) {
    .email-container { margin: 0; border-radius: 0; }
    .header { padding: 40px 24px; }
    .header h1 { font-size: 28px; }
    .header p { font-size: 16px; }
    .content { padding: 40px 24px; }
    .main-card { padding: 32px 24px; }
    .amount { font-size: 36px; }
    .description { font-size: 24px; }
    .details { padding: 24px; }
    .button { padding: 16px 32px; font-size: 15px; }
    .participants-section { padding: 24px; }
    .value { max-width: 50%; font-size: 15px; }
    .label { font-size: 12px; }
  }
`;

// Email templates
const getExpenseAddedEmailTemplate = (
  expense: Doc<"expenses">,
  payer: Doc<"users">,
  participants: Doc<"users">[],
  groupName?: string
) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const participantNames = participants
    .map(p => p.name)
    .filter(name => name !== payer.name)
    .join(', ');

  const subject = groupName 
    ? `New expense added to ${groupName}: ${expense.description}`
    : `New expense with ${participantNames}: ${expense.description}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Expense Added</title>
      <style>${getEmailStyles()}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>💰 New Expense Added</h1>
          <p>${groupName ? `Group: ${groupName}` : 'Individual Expense'}</p>
        </div>
        <div class="content">
          <div class="main-card">
            <div class="description">${expense.description}</div>
            <div class="amount">${formatAmount(expense.amount)}</div>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">Paid by</span>
                <span class="value">${payer.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date</span>
                <span class="value">${formatDate(expense.date)}</span>
              </div>
              ${expense.category ? `
              <div class="detail-row">
                <span class="label">Category</span>
                <span class="value">${expense.category}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">Split Type</span>
                <span class="value">${expense.splitType}</span>
              </div>
            </div>

            ${participants.length > 1 ? `
            <div class="participants-section">
              <div class="participants-title">Participants</div>
              ${participants.map(p => `
                <div class="participant-item">
                  <div class="participant-avatar">${p.name.charAt(0)}</div>
                  <div class="participant-name">${p.name}${p._id === expense.paidByUserId ? ' (Paid)' : ''}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          
          <p class="message-text">
            This expense has been added to your Splitz account. You can view the details and settle up in the app.
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
              View in Splitz
            </a>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from Splitz - your expense splitting app</p>
          <p class="footer-note">
            You're receiving this because you're part of this expense. 
            <a href="#" class="footer-link">Manage notifications</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

const getExpenseDeletedEmailTemplate = (
  expense: Doc<"expenses">,
  deletedBy: Doc<"users">,
  participants: Doc<"users">[],
  groupName?: string
) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const participantNames = participants
    .map(p => p.name)
    .filter(name => name !== deletedBy.name)
    .join(', ');

  const subject = groupName 
    ? `Expense deleted from ${groupName}: ${expense.description}`
    : `Expense deleted: ${expense.description}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Expense Deleted</title>
      <style>${getEmailStyles()}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
          <h1>🗑️ Expense Deleted</h1>
          <p>${groupName ? `Group: ${groupName}` : 'Individual Expense'}</p>
        </div>
        <div class="content">
          <div class="main-card" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);">
            <div class="description">${expense.description}</div>
            <div class="amount" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${formatAmount(expense.amount)}</div>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">Deleted by</span>
                <span class="value">${deletedBy.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Original Date</span>
                <span class="value">${formatDate(expense.date)}</span>
              </div>
              ${expense.category ? `
              <div class="detail-row">
                <span class="label">Category</span>
                <span class="value">${expense.category}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">Split Type</span>
                <span class="value">${expense.splitType}</span>
              </div>
            </div>
          </div>
          
          <p class="message-text">
            This expense has been deleted from your Splitz account. Any pending balances related to this expense have been updated.
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
              View Dashboard
            </a>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from Splitz - your expense splitting app</p>
          <p class="footer-note">
            You're receiving this because you were part of this expense. 
            <a href="#" class="footer-link">Manage notifications</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

const getSettlementAddedEmailTemplate = (
  settlement: Doc<"settlements">,
  payer: Doc<"users">,
  receiver: Doc<"users">,
  groupName?: string
) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const subject = groupName 
    ? `Payment recorded in ${groupName}: ${formatAmount(settlement.amount)}`
    : `Payment recorded: ${formatAmount(settlement.amount)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Recorded</title>
      <style>${getEmailStyles()}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
          <h1>💸 Payment Recorded</h1>
          <p>${groupName ? `Group: ${groupName}` : 'Individual Payment'}</p>
        </div>
        <div class="content">
          <div class="main-card" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
            <div class="description">Payment Details</div>
            <div class="amount" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${formatAmount(settlement.amount)}</div>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">Paid by</span>
                <span class="value">${payer.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Received by</span>
                <span class="value">${receiver.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date</span>
                <span class="value">${formatDate(settlement.date)}</span>
              </div>
              ${settlement.note ? `
              <div class="detail-row">
                <span class="label">Note</span>
                <span class="value">${settlement.note}</span>
              </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <span class="status-badge status-success">Payment Completed</span>
            </div>
          </div>
          
          <p class="message-text">
            This payment has been recorded in your Splitz account. Your balances have been updated accordingly.
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
              View Dashboard
            </a>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from Splitz - your expense splitting app</p>
          <p class="footer-note">
            You're receiving this because you're involved in this payment. 
            <a href="#" class="footer-link">Manage notifications</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

const getSettlementDeletedEmailTemplate = (
  settlement: Doc<"settlements">,
  deletedBy: Doc<"users">,
  payer: Doc<"users">,
  receiver: Doc<"users">,
  groupName?: string
) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const subject = groupName 
    ? `Payment deleted from ${groupName}: ${formatAmount(settlement.amount)}`
    : `Payment deleted: ${formatAmount(settlement.amount)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Deleted</title>
      <style>${getEmailStyles()}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
          <h1>🗑️ Payment Deleted</h1>
          <p>${groupName ? `Group: ${groupName}` : 'Individual Payment'}</p>
        </div>
        <div class="content">
          <div class="main-card" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);">
            <div class="description">Payment Details</div>
            <div class="amount" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${formatAmount(settlement.amount)}</div>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">Deleted by</span>
                <span class="value">${deletedBy.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Paid by</span>
                <span class="value">${payer.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Received by</span>
                <span class="value">${receiver.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Original Date</span>
                <span class="value">${formatDate(settlement.date)}</span>
              </div>
              ${settlement.note ? `
              <div class="detail-row">
                <span class="label">Note</span>
                <span class="value">${settlement.note}</span>
              </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <span class="status-badge status-danger">Payment Deleted</span>
            </div>
          </div>
          
          <p class="message-text">
            This payment has been deleted from your Splitz account. Your balances have been updated accordingly.
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
              View Dashboard
            </a>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from Splitz - your expense splitting app</p>
          <p class="footer-note">
            You're receiving this because you were involved in this payment. 
            <a href="#" class="footer-link">Manage notifications</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

// Mutation to send expense added notification
export const sendExpenseAddedNotification = internalMutation({
  args: {
    expenseId: v.id("expenses"),
    participantIds: v.array(v.id("users")),
  },
  handler: async (ctx, { expenseId, participantIds }) => {
    const expense = await ctx.db.get(expenseId);
    if (!expense) return;
    const payer = await ctx.db.get(expense.paidByUserId);
    if (!payer) return;
    const participants = await Promise.all(participantIds.map(id => ctx.db.get(id)));
    const validParticipants = participants.filter(p => p !== null) as Doc<"users">[];
    let groupName: string | undefined;
    if (expense.groupId) {
      const group = await ctx.db.get(expense.groupId);
      groupName = group?.name;
    }
    const { subject, html } = getExpenseAddedEmailTemplate(
      expense,
      payer,
      validParticipants,
      groupName
    );
    const participantsToEmail = validParticipants.filter(participant => participant._id !== expense.paidByUserId && participant.email);
    for (const participant of participantsToEmail) {
      await ctx.scheduler.runAfter(0, api.emails.sendEmailAction, {
        to: participant.email!,
        subject,
        html,
      });
    }
  },
});

// Mutation to send expense deleted notification
export const sendExpenseDeletedNotification = internalMutation({
  args: {
    expense: v.object({
      description: v.string(),
      amount: v.number(),
      date: v.number(),
      category: v.optional(v.string()),
      splitType: v.string(),
      paidByUserId: v.id("users"),
      groupId: v.optional(v.id("groups")),
    }),
    deletedByUserId: v.id("users"),
    participantIds: v.array(v.id("users")),
  },
  handler: async (ctx, { expense, deletedByUserId, participantIds }) => {
    const deletedBy = await ctx.db.get(deletedByUserId);
    if (!deletedBy) return;
    const participants = await Promise.all(participantIds.map(id => ctx.db.get(id)));
    const validParticipants = participants.filter(p => p !== null) as Doc<"users">[];
    let groupName: string | undefined;
    if (expense.groupId) {
      const group = await ctx.db.get(expense.groupId);
      groupName = group?.name;
    }
    const { subject, html } = getExpenseDeletedEmailTemplate(
      expense as Doc<"expenses">,
      deletedBy,
      validParticipants,
      groupName
    );
    const participantsToEmail = validParticipants.filter(participant => participant._id !== deletedByUserId && participant.email);
    for (const participant of participantsToEmail) {
      await ctx.scheduler.runAfter(0, api.emails.sendEmailAction, {
        to: participant.email!,
        subject,
        html,
      });
    }
  },
});

// Mutation to send settlement added notification
export const sendSettlementAddedNotification = internalMutation({
  args: {
    settlementId: v.id("settlements"),
  },
  handler: async (ctx, { settlementId }) => {
    const settlement = await ctx.db.get(settlementId);
    if (!settlement) return;
    const payer = await ctx.db.get(settlement.paidByUserId);
    const receiver = await ctx.db.get(settlement.receivedByUserId);
    if (!payer || !receiver) return;
    let groupName: string | undefined;
    if (settlement.groupId) {
      const group = await ctx.db.get(settlement.groupId);
      groupName = group?.name;
    }
    const { subject, html } = getSettlementAddedEmailTemplate(
      settlement,
      payer,
      receiver,
      groupName
    );
    if (receiver.email) {
      await ctx.scheduler.runAfter(0, api.emails.sendEmailAction, {
        to: receiver.email,
        subject,
        html,
      });
    }
  },
});

// Mutation to send settlement deleted notification
export const sendSettlementDeletedNotification = internalMutation({
  args: {
    settlement: v.object({
      amount: v.number(),
      note: v.optional(v.string()),
      date: v.number(),
      paidByUserId: v.id("users"),
      receivedByUserId: v.id("users"),
      groupId: v.optional(v.id("groups")),
    }),
    deletedByUserId: v.id("users"),
  },
  handler: async (ctx, { settlement, deletedByUserId }) => {
    const deletedBy = await ctx.db.get(deletedByUserId);
    const payer = await ctx.db.get(settlement.paidByUserId);
    const receiver = await ctx.db.get(settlement.receivedByUserId);
    if (!deletedBy || !payer || !receiver) return;
    let groupName: string | undefined;
    if (settlement.groupId) {
      const group = await ctx.db.get(settlement.groupId);
      groupName = group?.name;
    }
    const { subject, html } = getSettlementDeletedEmailTemplate(
      settlement as Doc<"settlements">,
      deletedBy,
      payer,
      receiver,
      groupName
    );
    if (payer.email && payer._id !== deletedByUserId) {
      await ctx.scheduler.runAfter(0, api.emails.sendEmailAction, {
        to: payer.email,
        subject,
        html,
      });
    }
    if (receiver.email && receiver._id !== deletedByUserId) {
      await ctx.scheduler.runAfter(0, api.emails.sendEmailAction, {
        to: receiver.email,
        subject,
        html,
      });
    }
  },
});

 