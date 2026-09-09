import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import './auth.css';

export function AuthLayout({ mode, title, subtitle, children }: {
  mode: 'login' | 'register'; title: string; subtitle: string; children: ReactNode;
}) {
  return (
    <div className={`auth-page auth-page--${mode}`}>
      <header className="auth-header">
        <Link to="/" className="auth-back"><ArrowLeft size={16} aria-hidden="true" /> Back to home</Link>
      </header>
      <main className="auth-main">
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-intro">
            <span className="auth-eyebrow">YOUR RESTAURANT, SIMPLIFIED</span>
            <h1 id="auth-title">{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
          <p className="auth-switch">
            {mode === 'login' ? 'New to Ordio?' : 'Already have an account?'}{' '}
            <Link to={mode === 'login' ? '/register' : '/login'}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
        </section>
        <p className="auth-caption">Your menu, tables and orders. All in one place.</p>
      </main>
      <footer className="auth-footer">Ordio &middot; Made for your restaurant</footer>
    </div>
  );
}

export function AuthField({ label, error, hint, type, id, ...props }: InputHTMLAttributes<HTMLInputElement> & {
  label: string; error?: string; hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <input {...props} id={id} type={password && visible ? 'text' : type}
          className={password ? 'auth-input auth-password' : 'auth-input'}
          aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />
        {password && <button type="button" className="auth-reveal" onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>}
      </div>
      {error ? <p id={`${id}-error`} className="auth-error" role="alert">{error}</p>
        : hint && <p id={`${id}-hint`} className="auth-hint">{hint}</p>}
    </div>
  );
}
