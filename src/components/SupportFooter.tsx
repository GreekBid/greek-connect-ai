import { Mail } from "lucide-react";

export default function SupportFooter() {
  return (
    <div className="border-t border-border bg-muted/30 px-4 py-3 text-center">
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Mail className="w-3.5 h-3.5" />
        Having issues or need help? Contact us at{" "}
        <a href="mailto:admin@greekbid.com" className="text-primary hover:underline font-medium">
          admin@greekbid.com
        </a>
      </p>
    </div>
  );
}
