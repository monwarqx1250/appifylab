'use client';

import React, { useState } from 'react';

const VARIANT_CLASSES = {
  registration: {
    form: '_social_registration_form',
    inputWrap: '_social_registration_form_input _mar_b14',
    label: '_social_registration_label _mar_b8',
    input: 'form-control _social_registration_input',
    submitBtnWrap: '_social_registration_form_btn _mar_t40 _mar_b60',
    submitBtn: '_social_registration_form_btn_link _btn1',
  },
  login: {
    form: '_social_login_form',
    inputWrap: '_social_login_form_input _mar_b14',
    label: '_social_login_label _mar_b8',
    input: 'form-control _social_login_input',
    submitBtnWrap: '_social_login_form_btn _mar_t40 _mar_b60',
    submitBtn: '_social_login_form_btn_link _btn1',
  },
};

/**
 * @param {object} props
 * @param {'registration' | 'login'} props.variant
 * @param {{ name: string, type: string, label: string, autoComplete?: string }[]} props.fields
 * @param {string} props.submitLabel
 * @param {React.ReactNode} [props.beforeSubmit]
 * @param {(values: Record<string, string>) => Promise<{ error?: string } | void>} props.onSubmit
 */
export default function AuthForm({
  variant,
  fields,
  submitLabel,
  beforeSubmit = null,
  onSubmit,
}) {
  const c = VARIANT_CLASSES[variant] || VARIANT_CLASSES.registration;
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    /** @type {Record<string, string>} */
    const values = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') values[key] = value;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(values);
      if (result && typeof result === 'object' && result.error) {
        setError(result.error);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={c.form} onSubmit={handleSubmit} noValidate>
      {fields.map((f) => (
        <div className="row" key={f.name}>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div className={c.inputWrap}>
              <label className={`${c.label}`} htmlFor={`auth-field-${f.name}`}>
                {f.label}
              </label>
              <input
                id={`auth-field-${f.name}`}
                type={f.type}
                name={f.name}
                className={c.input}
                autoComplete={f.autoComplete}
                required
              />
            </div>
          </div>
        </div>
      ))}

      {beforeSubmit}

      {error ? (
        <div className="row">
          <div className="col-12">
            <p className="_mar_b14" style={{ color: 'var(--bs-danger, #dc3545)', fontSize: '0.9rem' }} role="alert">
              {error}
            </p>
          </div>
        </div>
      ) : null}

      <div className="row">
        <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
          <div className={c.submitBtnWrap}>
            <button type="submit" className={c.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
