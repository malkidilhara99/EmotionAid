"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Gender = "Male" | "Female" | "Other";

interface Profile {
  name: string;
  gender: Gender;
  photoDataUrl?: string | null;
}

const STORAGE_KEY = "emotionAidUser";

const Auth: React.FC = () => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("Other");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<Profile | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // inline custom dropdown state to avoid native select overlay issues
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const genderWrapperRef = useRef<HTMLDivElement | null>(null);
  const genders: Gender[] = ["Male", "Female", "Other"];

  useEffect(() => {
    // load existing profile from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedProfile(JSON.parse(raw));
      }
    } catch (err) {
      // ignore
      void err;
    }
  }, []);

  // close gender dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (genderWrapperRef.current && !genderWrapperRef.current.contains(e.target as Node)) {
        setIsGenderOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(photoFile);
    return () => {
      reader.onload = null;
    };
  }, [photoFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setPhotoFile(f);
  };

  // Compress image file to a smaller data URL to avoid exceeding localStorage quota
  const compressImage = (file: File, maxDim = 256, quality = 0.75): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const img = new window.Image();
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== 'string') return resolve(null);
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let { width, height } = img;
              if (width > height) {
                if (width > maxDim) {
                  height = Math.round((height *= maxDim / width));
                  width = maxDim;
                }
              } else {
                if (height > maxDim) {
                  width = Math.round((width *= maxDim / height));
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) return resolve(null);
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              resolve(dataUrl);
            } catch (err) {
              console.warn('Image compression failed', err);
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = reader.result as string;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } catch (err) {
        console.warn('compressImage error', err);
        resolve(null);
      }
    });
  };

  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    // compress image to reduce size before storing in localStorage
    let dataUrl: string | null = null;
    if (photoFile) {
      dataUrl = await compressImage(photoFile, 256, 0.75);
      // fallback to raw dataURL if compression failed but try to avoid large values
      if (!dataUrl) {
        try {
          const r = await new Promise<string | null>((res) => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result as string);
            fr.onerror = () => res(null);
            fr.readAsDataURL(photoFile);
          });
          dataUrl = r;
        } catch { dataUrl = null; }
      }
    }

    const profile: Profile = {
      name: name.trim(),
      gender,
      photoDataUrl: dataUrl,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setSavedProfile(profile);
      // notify other components that profile changed (other components listen for this)
      try {
        window.dispatchEvent(new CustomEvent('emotionAidUserChanged', { detail: profile }));
      } catch (evErr) {
        void evErr;
      }
    } catch (err) {
      // Handle QuotaExceededError: try to save without the photo to reduce size
      console.warn('Failed to save profile locally', err);
      const e = err as { name?: string; message?: string } | undefined;
      if (e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || /quota/i.test(String(e.message || '')))) {
        try {
          const fallback = { ...profile, photoDataUrl: null };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
          setSavedProfile(fallback);
          try { window.dispatchEvent(new CustomEvent('emotionAidUserChanged', { detail: fallback })); } catch (evErr) { void evErr; }
          // inform user visually
          alert('Profile saved, but avatar image was too large to store locally. Try adding a smaller photo.');
        } catch (e2) {
          console.warn('Fallback localStorage save also failed', e2);
          alert('Failed to save profile locally. Your browser storage may be full or restricted.');
        }
      }
    }

    // navigate to home after saving profile
    try {
      // replace so back doesn't return to sign-up
      router.replace('/');
    } catch (err) { void err; }

    // Optional: POST to backend if you want server persistence
    try {
      fetch("http://127.0.0.1:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, gender: profile.gender }),
      }).catch(() => {});
    } catch (err) {
      void err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedProfile(null);
    setName("");
    setGender("Other");
    setPhotoFile(null);
    setPhotoPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (savedProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'radial-gradient( circle at 10% 10%, rgba(6,182,212,0.06) 0%, rgba(0,0,0,0.6) 25%, rgba(58,36,64,0.6) 60% )',
      }}>
        <div className="w-full max-w-md px-6">
          <div className="mb-6 flex items-center justify-between text-white/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">EA</div>
              <div>
                <div className="text-lg font-semibold">EmotionAid</div>
                <div className="text-xs">AI Wellness Platform • Balanced Mode</div>
              </div>
            </div>
            <div className="text-sm">Welcome</div>
          </div>

          <div className="bg-gradient-to-br from-white/6 to-white/3 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                {savedProfile.photoDataUrl ? (
                  <Image src={savedProfile.photoDataUrl} alt="avatar" className="w-full h-full object-cover" width={80} height={80} />
                ) : (
                  <div className="text-2xl font-semibold">{savedProfile.name.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{savedProfile.name}</h3>
                <p className="text-sm text-white/80">{savedProfile.gender}</p>
              </div>
              <div>
                <button onClick={handleLogout} className="px-4 py-2 bg-rose-600 text-white rounded-xl shadow">Log out</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'radial-gradient( circle at 80% 20%, rgba(12,92,70,0.12) 0%, rgba(9,16,34,0.8) 30%, rgba(58,36,64,0.9) 70% )',
    }}>
      <div className="w-full max-w-md px-6">
        <div className="mb-6 flex items-center justify-between text-white/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">EA</div>
            <div>
              <div className="text-lg font-semibold">EmotionAid</div>
              <div className="text-xs">AI Wellness Platform • Balanced Mode</div>
            </div>
          </div>
          
        </div>

        <div className=" from-white/5 to-white/3 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10">
          <div className="flex items-center space-x-4 mb-4">
            
            <div>
              <h3 className="text-xl font-bold text-white">Sign up / Profile</h3>
              <p className="text-sm text-white/80">Create your profile to continue</p>
            </div>
          </div>

          <label className="block text-sm font-semibold text-white/90">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mt-1 mb-4 rounded-xl bg-white/6 border border-white/10 text-white placeholder:text-white/50"
            placeholder="Your name"
          />

          <label className="block text-sm font-semibold text-white/90">Gender</label>
          <div ref={genderWrapperRef} className="mt-1 mb-4">
            <button
              type="button"
              onClick={() => setIsGenderOpen(s => !s)}
              className="w-full p-3 rounded-xl border border-white/10 text-left text-white flex items-center justify-between"
            >
              <span className="text-sm">{gender}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isGenderOpen && (
              <div className="mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-inner py-1 max-h-40 overflow-auto">
                {genders.map(g => (
                  <div
                    key={g}
                    onClick={() => { setGender(g); setIsGenderOpen(false); }}
                    className={`px-4 py-2 text-sm text-white hover:bg-slate-800 cursor-pointer ${gender === g ? 'bg-slate-800 font-semibold' : ''}`}
                  >{g}</div>
                ))}
              </div>
            )}
          </div>

          <label className="block text-sm font-semibold text-white/90">Photo (please upload a photo with your clear face)</label>
          <div className="relative mt-1 mb-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full p-3 rounded-xl border border-white/10 text-white bg-transparent placeholder:text-white/50"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/70">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>

          {photoPreview && (
            <div className="mb-4">
              <Image src={photoPreview} alt="preview" className="w-28 h-28 rounded-full object-cover border border-white/10" width={112} height={112} />
            </div>
          )}

          <div className="flex space-x-3">
            <button onClick={handleSave} className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow">Save</button>
            <button onClick={() => { setName(''); setGender('Other'); setPhotoFile(null); setPhotoPreview(null); if (inputRef.current) inputRef.current.value = ''; }} className="px-4 py-3 bg-white/6 text-white rounded-2xl border border-white/10">Clear</button>
          </div>

          <p className="text-xs text-white/60 mt-4">Profile is stored locally in your browser. Server-side persistence is optional; enable `/users` endpoint to store profiles on the server.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
