# Admin Operations

## Purpose
This runbook defines the first operational toolkit for AppFit admins.

It focuses on:

- account communication
- reversible account control
- safer support workflows for a prototype

## Current Capabilities

From `/admin/users`, admins can now:

- send a manual in-app notification to any user
- send suggested reminders for missing profile, inconsistent onboarding, or missing activity
- review the notification audit trail

Super admins can additionally:

- change account roles
- deactivate a user account
- reactivate a previously deactivated account

## Account Status

The admin layer now introduces:

- `active`
- `suspended`

Behavior:

- `active`: the user can sign in and use the app normally
- `suspended`: the user is signed out and blocked from continuing in the app until reactivated

This is intentionally safer than hard deletion for a prototype.

## Why Deactivation Instead Of Deletion

For the current architecture, deactivation is the correct operational default because it:

- preserves user data
- avoids orphaning auth-linked records
- remains reversible
- reduces support risk during pilots and demos

## Notifications

Manual notifications are in-app only for now.

They support:

- custom title
- custom message
- severity
- optional CTA route inside the app

This extends the same notification center already used by admin reminders.

## SQL Dependencies

Before using these operations in Supabase, apply:

- `supabase_user_roles_admin.sql`
- `supabase_notifications.sql`

## Future Follow-up

The next admin operations that make sense after this base are:

- support audit for account status changes
- admin-triggered hard reset through a dedicated backend RPC
- scheduled reminders based on user health signals
