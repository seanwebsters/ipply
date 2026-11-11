import { KeyArt } from "@/components/key-art";
import { Wordmark } from "@/components/wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <KeyArt spec={{ motif: "orbit", palette: "noir" }} seed="ipply-auth" className="absolute inset-0 h-full w-full opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Wordmark tone="light" />
          <div>
            <p className="display text-6xl leading-[0.95]">
              Created by anyone.
              <br />
              <span className="iris-text italic">Loved by everyone.</span>
            </p>
            <p className="mt-6 max-w-sm text-white/60">The world&apos;s studio — where original characters, stories and worlds find their audience.</p>
          </div>
        </div>
      </div>
      <main id="main" className="flex flex-col px-6 py-10 sm:px-12">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">{children}</div>
      </main>
    </div>
  );
}
