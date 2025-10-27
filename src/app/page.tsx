import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            Monitor Ambiental
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Sistema de monitoreo de temperatura, humedad y radiación
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="rounded-md bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Iniciar sesión
          </Link>
          {/* Registro desactivado */}
          {/* <Link 
            href="/auth/register"
            className="rounded-md border border-zinc-300 px-6 py-3 font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Registrarse
          </Link> */}
        </div>
      </div>
    </div>
  );
}
