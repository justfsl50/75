import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="mx-auto max-w-lg px-4">
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms of Use</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Attendance75. All data stored locally on your device.
          </p>
        </div>
      </div>
    </footer>
  );
}
