'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';

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

function gatherFormValues(formEl) {
  const formData = new FormData(formEl);
  const values = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value;
  }
  formEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    if (cb.name) {
      values[cb.name] = cb.checked;
    }
  });
  return values;
}

/**
 * @param {object} props
 * @param {'registration' | 'login'} props.variant
 * @param {{ name: string, type: string, label: string, autoComplete?: string }[]} props.fields
 * @param {string} props.submitLabel
 * @param {React.ReactNode} [props.beforeSubmit]
 * @param {(values: Record<string, string>) => Promise<{ error?: string } | void>} props.onSubmit
 * @param {(values: Record<string, string>) => boolean} [props.validate]
 * @param {Record<string, React.ReactNode>} [props.fieldAfter]
 */
export default function AuthForm({
  variant,
  fields,
  submitLabel,
  beforeSubmit = null,
  onSubmit,
  validate,
  fieldAfter = {},
}) {
  const c = VARIANT_CLASSES[variant] || VARIANT_CLASSES.registration;
  const formRef = useRef(null);
  const [values, setValues] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMismatch =
    values.password && values.confirm_password && values.password !== values.confirm_password;

  const isValid = useMemo(() => {
    if (!validate) return true;
    return validate(values);
  }, [values, validate]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleInput = () => {
      setValues(gatherFormValues(form));
    };

    form.addEventListener('input', handleInput);
    form.addEventListener('change', handleInput);
    return () => {
      form.removeEventListener('input', handleInput);
      form.removeEventListener('change', handleInput);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formValues = gatherFormValues(e.currentTarget);
    setValues(formValues);

    if (validate && !validate(formValues)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(formValues);
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
    <form ref={formRef} className={c.form} onSubmit={handleSubmit} noValidate>
      {fields.map((f) => (
        <React.Fragment key={f.name}>
          <div className="row">
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
          {f.name === 'confirm_password' && passwordsMismatch && (
            <div className="row">
              <div className="col-12">
                <p style={{ color: '#dc3545', fontSize: '0.82rem', marginTop: '-10px', marginBottom: '14px' }}>
                  Passwords didn't match
                </p>
              </div>
            </div>
          )}
          {fieldAfter[f.name]?.(values[f.name])}
        </React.Fragment>
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
            <button
              type="submit"
              className={c.submitBtn}
              disabled={isSubmitting || !isValid}
              style={{ opacity: isSubmitting || !isValid ? 0.5 : 1, cursor: isSubmitting || !isValid ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? 'Please wait…' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
