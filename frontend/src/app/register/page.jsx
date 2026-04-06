'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { persistAuthSession, postAuth } from '@/lib/auth';
import { ToastProvider, useToast } from '@/components/ui/Toast';

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[a-z]/, label: 'One lowercase letter' },
  { regex: /[A-Z]/, label: 'One uppercase letter' },
  { regex: /\d/, label: 'One number' },
];

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  PASSWORD_REQUIREMENTS.forEach((req) => {
    if (req.regex.test(password)) score++;
  });
  const levels = [
    { score: 0, label: 'Very Weak', color: '#dc3545' },
    { score: 1, label: 'Weak', color: '#dc3545' },
    { score: 2, label: 'Fair', color: '#ffc107' },
    { score: 3, label: 'Good', color: '#20c997' },
    { score: 4, label: 'Strong', color: '#198754' },
  ];
  return levels[score] || levels[0];
}

function PasswordStrengthBar({ password }) {
  const { score, label, color } = useMemo(() => getPasswordStrength(password), [password]);
  
  if (!password) return null;
  
  return (
    <div className="row">
      <div className="col-12">
        <div style={{ marginTop: '-10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: i <= score ? color : '#e9ecef',
                  transition: 'background-color 0.2s ease',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', color: color }}>{label}</span>
        </div>
      </div>
    </div>
  );
}

function PasswordHelpText({ password }) {
  const satisfied = useMemo(() => {
    if (!password) return [];
    return PASSWORD_REQUIREMENTS.filter((req) => req.regex.test(password)).map((req) => req.label);
  }, [password]);

  return (
    <div className="row">
      <div className="col-12">
        {password && (
          <div style={{ marginTop: '-10px', marginBottom: '14px' }}>
            <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '16px', fontSize: '0.75rem', color: '#6c757d' }}>
              {PASSWORD_REQUIREMENTS.map((req, i) => {
                const isSatisfied = req.regex.test(password || '');
                return (
                  <li key={i} style={{ color: isSatisfied ? '#198754' : '#6c757d', marginBottom: '2px' }}>
                    {isSatisfied && <span style={{ marginRight: '4px' }}>✓</span>}
                    {req.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const REGISTER_FIELDS = [
  { name: 'firstName', type: 'text', label: 'First Name', autoComplete: 'given-name' },
  { name: 'lastName', type: 'text', label: 'Last Name', autoComplete: 'family-name' },
  { name: 'email', type: 'email', label: 'Email', autoComplete: 'email' },
  { name: 'password', type: 'password', label: 'Password', autoComplete: 'new-password' },
  { name: 'confirm_password', type: 'password', label: 'Confirm Password', autoComplete: 'new-password' },
];

export default function RegisterPage() {
  return (
    <ToastProvider>
      <RegisterContent />
    </ToastProvider>
  );
}

function RegisterContent() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleRegister = async (values) => {
    const { confirm_password: _confirm, terms: _terms, ...requestBody } = values;
    const { ok, status, data } = await postAuth('/auth/register', requestBody);

    if (ok && status === 201 && data) {
      persistAuthSession(data);
      showToast('Registration successful!', 'success');
      router.push('/feed');
      return;
    }

    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Registration failed. Please try again.';
    showToast(message, 'error');
  };

  const beforeSubmit = (
    <div className="row">
      <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
        <div className="form-check _social_registration_form_check">
          <input
            className="form-check-input _social_registration_form_check_input"
            type="checkbox"
            id="register-terms"
            name="terms"
            required
          />
          <label className="form-check-label _social_registration_form_check_label" htmlFor="register-terms">
            I agree to terms & conditions
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img src="/assets/images/registration.png" alt="Image" />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src="/assets/images/registration1.png" alt="Image" />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <img src="/assets/images/logo.svg" alt="Image" className="_right_logo" />
                </div>
                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
                <button type="button" className="_social_registration_content_btn _mar_b40">
                  <img src="/assets/images/google.svg" alt="Image" className="_google_img" />{' '}
                  <span>Register with google</span>
                </button>
                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                <AuthForm
                  variant="registration"
                  fields={REGISTER_FIELDS}
                  submitLabel="Register now"
                  beforeSubmit={beforeSubmit}
                  onSubmit={handleRegister}
                  fieldAfter={{
                    password: (value) => (
                      <>
                        <PasswordHelpText password={value} />
                        <PasswordStrengthBar password={value} />
                      </>
                    ),
                  }}
                  validate={(v) => {
                    const { firstName, lastName, email, password, confirm_password, terms } = v;
                    if (!firstName?.trim()) return false;
                    if (!lastName?.trim()) return false;
                    if (!email?.trim()) return false;
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
                    if (!password) return false;
                    if (password.length < 8) return false;
                    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return false;
                    if (password !== confirm_password) return false;
                    if (!terms) return false;
                    return true;
                  }}
                />

                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account? <Link href="/login">Login</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
