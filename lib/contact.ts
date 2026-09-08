import { formConfig } from '@/config/site';
import { budgetRanges, projectTypes } from '@/data/social';

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  message: string;
  /** Honeypot - must stay empty. Bots fill it, people never see it. */
  company?: string;
};

/**
 * Validation returns error CODES, not sentences.
 *
 * The API route and the form share this function, and the site is bilingual —
 * so the server must not decide what language the visitor reads. The code is
 * looked up in the active dictionary at render time instead.
 */
export type ErrorCode =
  | 'name'
  | 'nameLong'
  | 'emailRequired'
  | 'emailInvalid'
  | 'phone'
  | 'projectTypeRequired'
  | 'optionInvalid'
  | 'messageShort'
  | 'messageLong';

export type FieldErrors = Partial<Record<keyof ContactPayload, ErrorCode>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * One validator, used by both the form and the API route.
 *
 * Client-side validation is a convenience; the route runs the exact same
 * function so a crafted request cannot bypass it.
 */
export function validateContact(input: Partial<ContactPayload>): FieldErrors {
  const errors: FieldErrors = {};

  const name = (input.name ?? '').trim();
  if (name.length < 2) errors.name = 'name';
  else if (name.length > 120) errors.name = 'nameLong';

  const email = (input.email ?? '').trim();
  if (!email) errors.email = 'emailRequired';
  else if (!EMAIL.test(email)) errors.email = 'emailInvalid';

  const phone = (input.phone ?? '').trim();
  if (phone && !/^[\d\s()+-]{6,24}$/.test(phone)) {
    errors.phone = 'phone';
  }

  const projectType = (input.projectType ?? '').trim();
  if (!projectType) errors.projectType = 'projectTypeRequired';
  else if (!projectTypes.includes(projectType as (typeof projectTypes)[number])) {
    errors.projectType = 'optionInvalid';
  }

  const budget = (input.budget ?? '').trim();
  if (budget && !budgetRanges.includes(budget as (typeof budgetRanges)[number])) {
    errors.budget = 'optionInvalid';
  }

  const message = (input.message ?? '').trim();
  if (message.length < 10) errors.message = 'messageShort';
  else if (message.length > formConfig.maxMessageLength) {
    errors.message = 'messageLong';
  }

  return errors;
}

export const initialContactValues: ContactPayload = {
  name: '',
  email: '',
  phone: '',
  projectType: '',
  budget: '',
  message: '',
  company: '',
};
