import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {BotIcon} from './components/icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha no login.');
      }

      // Store the token (e.g., in localStorage) and navigate
      localStorage.setItem('token', data.token);
      navigate('/main');
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden">
      {/* Background abstract lines */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="orange-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-200 0 C 100 200, 300 100, 1200 400 L 1200 0 Z"
            fill="url(#orange-gradient)"
            transform="translate(0, 100) rotate(5)"
          />
          <path
            d="M500 1000 C 800 800, 1000 900, 2200 600 L 2200 1000 Z"
            fill="url(#orange-gradient)"
            transform="translate(0, -150) rotate(-10)"
          />
        </svg>
      </div>

      <div className="w-full max-w-4xl flex items-center justify-between p-8 z-10">
        {/* Left Side: Logo */}
        <div className="w-1/2 flex flex-col items-start text-left pr-16">
          <div className="flex items-center gap-4 mb-4">
            <BotIcon className="w-16 h-16 text-primary" />
            <div>
              <h1 className="text-5xl font-bold text-primary">ORÁCULO</h1>
              <h1 className="text-5xl font-bold text-foreground">VISION</h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            Análise de gráficos financeiros com inteligência artificial.
          </p>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-1/2 max-w-sm">
          <div className="bg-secondary/30 backdrop-blur-sm border border-border/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Entrar</h2>
            {error && <p className="text-destructive text-center text-sm mb-4">{error}</p>}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="text-sm text-muted-foreground">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background/50 border border-border/30 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="text-sm text-muted-foreground"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/50 border border-border/30 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="text-right">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                  Esqueceu a senha?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Entrar
              </button>
              <div className="text-center text-sm text-muted-foreground mt-4">
                Ainda não tem uma conta?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Inscreva-se
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
