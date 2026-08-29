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

export type FieldErrors = Partial<Record<keyof ContactPayload, string>>;

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
  if (name.length < 2) errors.name = 'Please enter your name.';
  else if (name.length > 120) errors.name = 'That name is too long.';

  const email = (input.email ?? '').trim();
  if (!email) errors.email = 'Please enter your email address.';
  else if (!EMAIL.test(email)) errors.email = 'That email address does not look right.';

  const phone = (input.phone ?? '').trim();
  if (phone && !/^[\d\s()+-]{6,24}$/.test(phone)) {
    errors.phone = 'Please enter a valid phone number, or leave it empty.';
  }

  const projectType = (input.projectType ?? '').trim();
  if (!projectType) errors.projectType = 'Please choose a project type.';
  else if (!projectTypes.includes(projectType as (typeof projectTypes)[number])) {
    errors.projectType = 'Please choose one of the listed options.';
  }

  const budget = (input.budget ?? '').trim();
  if (budget && !budgetRanges.includes(budget as (typeof budgetRanges)[number])) {
    errors.budget = 'Please choose one of the listed options.';
  }

  const message = (input.message ?? '').trim();
  if (message.length < 10) errors.message = 'Tell me a little more about the project.';
  else if (message.length > formConfig.maxMessageLength) {
    errors.message = `Please keep this under ${formConfig.maxMessageLength} characters.`;
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
