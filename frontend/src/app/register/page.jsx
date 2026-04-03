'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { persistAuthSession, postAuth } from '@/lib/auth';

const REGISTER_FIELDS = [
  { name: 'firstName', type: 'text', label: 'First Name', autoComplete: 'given-name' },
  { name: 'lastName', type: 'text', label: 'Last Name', autoComplete: 'family-name' },
  { name: 'email', type: 'email', label: 'Email', autoComplete: 'email' },
  { name: 'password', type: 'password', label: 'Password', autoComplete: 'new-password' },
  { name: 'confirm_password', type: 'password', label: 'Confirm Password', autoComplete: 'new-password' },
];

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (values) => {
    if (values.password !== values.confirm_password) {
      return { error: 'Passwords do not match.' };
    }

    const { confirm_password: _confirm, terms: _terms, ...requestBody } = values;
    const { ok, status, data } = await postAuth('/auth/register', requestBody);

    if (ok && status === 201 && data) {
      persistAuthSession(data);
      router.push('/feed');
      return;
    }

    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Registration failed. Please try again.';
    return { error: message };
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
