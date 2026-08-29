'use client';

import { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { formConfig } from '@/config/site';
import { budgetRanges, projectTypes } from '@/data/social';
import {
  initialContactValues,
  validateContact,
  type ContactPayload,
  type FieldErrors,
} from '@/lib/contact';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const fieldBase =
  'w-full border-b border-rule bg-transparent py-3 text-[1.0625rem] tracking-[-0.015em] text-ink outline-none transition-colors duration-300 placeholder:text-ink-faint focus:border-accent';

export function ContactForm() {
  const [values, setValues] = useState<ContactPayload>(initialContactValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState('');
  const statusRef = useRef<HTMLParagraphElement>(null);

  const update = useCallback(
    (field: keyof ContactPayload) =>
      (
        event: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        const value = event.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
      },
    []
  );

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError('');

      const nextErrors = validateContact(values);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        setStatus('error');
        // Move focus to the first field with a problem.
        const first = Object.keys(nextErrors)[0];
        document.getElementById(`contact-${first}`)?.focus();
        return;
      }

      setStatus('submitting');

      try {
        const response = await fetch(formConfig.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const data = (await response.json().catch(() => ({}))) as {
          errors?: FieldErrors;
          error?: string;
        };

        if (!response.ok) {
          if (data.errors) setErrors(data.errors);
          setFormError(
            data.error ?? 'Something went wrong sending your message. Please try again.'
          );
          setStatus('error');
          statusRef.current?.focus();
          return;
        }

        setValues(initialContactValues);
        setErrors({});
        setStatus('success');
        statusRef.current?.focus();
      } catch {
        setFormError(
          'Could not reach the server. Please check your connection and try again.'
        );
        setStatus('error');
        statusRef.current?.focus();
      }
    },
    [values]
  );

  if (status === 'success') {
    return (
      <div className="border-t border-accent pt-8">
        <p className="label label--accent">Message sent</p>
        <p className="mt-5 text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-[1.1] tracking-[-0.035em]">
          Thank you &mdash; your message is on its way.
        </p>
        <p className="mt-4 max-w-md text-ink-mute">
          I read every enquiry personally and will reply as soon as I can.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="label link-underline mt-8 text-accent-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="border-t border-rule-strong pt-8">
      {/* Honeypot - visually and semantically hidden from real users. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={update('company')}
        />
      </div>

      <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
        <Field
          id="contact-name"
          label="Name"
          required
          error={errors.name}
          input={
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              className={fieldBase}
              placeholder="Your full name"
              value={values.name}
              onChange={update('name')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
            />
          }
        />

        <Field
          id="contact-email"
          label="Email"
          required
          error={errors.email}
          input={
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              className={fieldBase}
              placeholder="you@company.com"
              value={values.email}
              onChange={update('email')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
            />
          }
        />

        <Field
          id="contact-phone"
          label="Phone"
          hint="Optional"
          error={errors.phone}
          input={
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={fieldBase}
              placeholder="+000 000 0000"
              value={values.phone}
              onChange={update('phone')}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
            />
          }
        />

        <Field
          id="contact-projectType"
          label="Project type"
          required
          error={errors.projectType}
          input={
            <select
              id="contact-projectType"
              name="projectType"
              className={`${fieldBase} appearance-none`}
              value={values.projectType}
              onChange={update('projectType')}
              aria-invalid={Boolean(errors.projectType)}
              aria-describedby={
                errors.projectType ? 'contact-projectType-error' : undefined
              }
            >
              <option value="">Select an option</option>
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          }
        />

        <Field
          id="contact-budget"
          label="Budget"
          hint="Optional"
          error={errors.budget}
          input={
            <select
              id="contact-budget"
              name="budget"
              className={`${fieldBase} appearance-none`}
              value={values.budget}
              onChange={update('budget')}
              aria-invalid={Boolean(errors.budget)}
              aria-describedby={errors.budget ? 'contact-budget-error' : undefined}
            >
              <option value="">Prefer not to say</option>
              {budgetRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          }
        />

        <div className="sm:col-span-2">
          <Field
            id="contact-message"
            label="Message"
            required
            hint={`${values.message.length} / ${formConfig.maxMessageLength}`}
            error={errors.message}
            input={
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                className={`${fieldBase} resize-y`}
                placeholder="What are you building, and what does it need to do?"
                maxLength={formConfig.maxMessageLength}
                value={values.message}
                onChange={update('message')}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
              />
            }
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          cursorLabel="SEND"
          withArrow
          {...(status === 'submitting' ? { disabled: true } : {})}
          className={status === 'submitting' ? 'pointer-events-none opacity-60' : ''}
        >
          {status === 'submitting' ? 'Sending' : 'Start a Conversation'}
        </Button>

        <p
          ref={statusRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className={`max-w-sm text-sm leading-relaxed outline-none ${
            formError ? 'text-accent-deep' : 'text-ink-mute'
          }`}
        >
          {formError || 'Usually a reply within one working day.'}
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  input,
  error,
  hint,
  required,
}: {
  id: string;
  label: string;
  input: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="label">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-accent">
              *
            </span>
          )}
        </label>
        {hint && <span className="label text-ink-faint">{hint}</span>}
      </div>

      <div className="mt-1">{input}</div>

      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-accent-deep">
          {error}
        </p>
      )}
    </div>
  );
}
