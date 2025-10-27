"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Decodificar el token para obtener info del usuario (simple, sin verificar firma en cliente)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Usar timeout para evitar setState síncrono en effect
      setTimeout(() => {
        setUser({ id: payload.userId, email: payload.email });
        setLoading(false);
        // Cargar API Key si existe
        loadApiKey(token);
      }, 0);
    } catch (err) {
      console.error("Error decodificando token:", err);
      localStorage.removeItem("token");
      router.push("/auth/login");
    }
  }, [router]);

  const loadApiKey = async (token: string) => {
    try {
      const response = await fetch("/api/user/apikey", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error("Error cargando API Key:", error);
    }
  };

  const handleGenerateApiKey = async () => {
    setGeneratingKey(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/user/generate-apikey", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setApiKey(data.apiKey);
      } else {
        alert(data.error || "Error generando API Key");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-600 dark:text-zinc-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-zinc-900 sm:items-start">
        <div className="w-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cerrar sesión
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Información del usuario
              </h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Email:
                  </dt>
                  <dd className="text-base text-zinc-900 dark:text-zinc-50">
                    {user?.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    ID:
                  </dt>
                  <dd className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                    {user?.id}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                API Key para ESP32
              </h2>

              {apiKey ? (
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                      Tu API Key:
                    </dt>
                    <div className="flex gap-2">
                      <dd className="flex-1 text-sm font-mono bg-zinc-100 dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-700 break-all">
                        {apiKey}
                      </dd>
                      <button
                        onClick={handleCopyApiKey}
                        className="px-4 py-2 text-sm font-semibold rounded-md bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                      >
                        {copySuccess ? "✓ Copiado" : "Copiar"}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateApiKey}
                    disabled={generatingKey}
                    className="w-full rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    {generatingKey ? "Generando..." : "Regenerar API Key"}
                  </button>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    ⚠️ Al regenerar, la API Key anterior dejará de funcionar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Genera una API Key para conectar tu ESP32 al servidor
                  </p>
                  <button
                    onClick={handleGenerateApiKey}
                    disabled={generatingKey}
                    className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {generatingKey ? "Generando..." : "Generar API Key"}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Próximamente
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Aquí se mostrarán los datos ambientales de tu monitor
                (temperatura, humedad, radiación, etc.)
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
