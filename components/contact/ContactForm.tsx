'use client';

import { useCallback, useRef, useState } from 'react';

import { useLocale } from '@/components/i18n/LocaleProvider';
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
  'w-full border-b border-rule bg-transparent py-3 text-[1.0625rem] text-ink outline-none transition-colors duration-300 placeholder:text-ink-faint focus:border-accent';

export function ContactForm() {
  const { t, fill } = useLocale();
  const [values, setValues] = useState<ContactPayload>(initialContactValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState('');
  const statusRef = useRef<HTMLParagraphElement>(null);

  /** Turns a validation code into a sentence in the reader's language. */
  const messageFor = useCallback(
    (field: keyof ContactPayload): string | undefined => {
      const code = errors[field];
      if (!code) return undefined;
      const text = t.form.errors[code];
      return code === 'messageLong'
        ? fill(text, { max: formConfig.maxMessageLength })
        : text;
    },
    [errors, t, fill]
  );

  const update = useCallback(
    (field: keyof ContactPayload) =>
      (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
          code?: keyof typeof t.form.errors;
        };

        if (!response.ok) {
          if (data.errors) setErrors(data.errors);
          // The server answers with a code so the message can be rendered in
          // whichever language the visitor is actually reading.
          setFormError((data.code && t.form.errors[data.code]) || t.form.errors.generic);
          setStatus('error');
          statusRef.current?.focus();
          return;
        }

        setValues(initialContactValues);
        setErrors({});
        setStatus('success');
        statusRef.current?.focus();
      } catch {
        setFormError(t.form.errors.network);
        setStatus('error');
        statusRef.current?.focus();
      }
    },
    [values, t]
  );

  if (status === 'success') {
    return (
      <div className="border-t border-accent pt-8">
        <p className="label label--accent">{t.form.successLabel}</p>
        <p className="mt-5 text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-[1.1]">
          {t.form.successTitle}
        </p>
        <p className="mt-4 max-w-md text-ink-body">{t.form.successBody}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="label link-underline mt-8 text-accent-ink"
        >
          {t.form.sendAnother}
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
        <Field id="contact-name" label={t.form.name} required error={messageFor('name')}>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            className={fieldBase}
            placeholder={t.form.namePlaceholder}
            value={values.name}
            onChange={update('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
        </Field>

        <Field id="contact-email" label={t.form.email} required error={messageFor('email')}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            className={fieldBase}
            placeholder={t.form.emailPlaceholder}
            value={values.email}
            onChange={update('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
        </Field>

        <Field
          id="contact-phone"
          label={t.form.phone}
          hint={t.form.optional}
          error={messageFor('phone')}
        >
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            dir="ltr"
            className={fieldBase}
            placeholder={t.form.phonePlaceholder}
            value={values.phone}
            onChange={update('phone')}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
          />
        </Field>

        <Field
          id="contact-projectType"
          label={t.form.projectType}
          required
          error={messageFor('projectType')}
        >
          <select
            id="contact-projectType"
            name="projectType"
            className={`${fieldBase} appearance-none`}
            value={values.projectType}
            onChange={update('projectType')}
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={errors.projectType ? 'contact-projectType-error' : undefined}
          >
            <option value="">{t.form.selectOption}</option>
            {/* The value submitted is the canonical English one; only the label
                is translated, so the inbox and validation stay language-neutral. */}
            {projectTypes.map((type, i) => (
              <option key={type} value={type}>
                {t.form.projectTypes[i]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="contact-budget"
          label={t.form.budget}
          hint={t.form.optional}
          error={messageFor('budget')}
        >
          <select
            id="contact-budget"
            name="budget"
            className={`${fieldBase} appearance-none`}
            value={values.budget}
            onChange={update('budget')}
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={errors.budget ? 'contact-budget-error' : undefined}
          >
            <option value="">{t.form.preferNotToSay}</option>
            {budgetRanges.map((range, i) => (
              <option key={range} value={range}>
                {t.form.budgetRanges[i]}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field
            id="contact-message"
            label={t.form.message}
            required
            hint={`${values.message.length} / ${formConfig.maxMessageLength}`}
            error={messageFor('message')}
          >
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              className={`${fieldBase} resize-y`}
              placeholder={t.form.messagePlaceholder}
              maxLength={formConfig.maxMessageLength}
              value={values.message}
              onChange={update('message')}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
            />
          </Field>
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
          {status === 'submitting' ? t.form.submitting : t.form.submit}
        </Button>

        <p
          ref={statusRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className={`max-w-sm text-sm leading-relaxed outline-none ${
            formError ? 'text-accent-deep' : 'text-ink-body'
          }`}
        >
          {formError || t.form.replyNote}
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  children,
  error,
  hint,
  required,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
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
            <span aria-hidden="true" className="text-accent ms-1">
              *
            </span>
          )}
        </label>
        {hint && <span className="label text-ink-faint">{hint}</span>}
      </div>

      <div className="mt-1">{children}</div>

      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-accent-deep">
          {error}
        </p>
      )}
    </div>
  );
}
