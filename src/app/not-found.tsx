import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-20 text-center">
      <div>
        <LogoMark className="mx-auto size-24" />
        <div className="h-display mt-8 text-[120px] text-pepe md:text-[180px]">404</div>
        <h1 className="h-display text-3xl md:text-5xl">THIS PEPE HOPPED AWAY.</h1>
        <p className="mx-auto mt-4 max-w-md text-mute">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">Back home</Link>
          <Link href="/explore" className="btn-ghost">Explore gallery</Link>
        </div>
      </div>
    </div>
  );
}
