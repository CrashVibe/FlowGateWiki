import type { ButtonProps } from "fumadocs-ui/components/ui/button";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import Link from "next/link";

import { cn } from "@/lib/cn";

interface ButtonOwnProps {
  href?: string;
  target?: string;
  rel?: string;
  variant?: ButtonProps["variant"];
  className?: string;
  children?: React.ReactNode;
}

export const Button = ({ href, variant, className, children, target, rel }: ButtonOwnProps) => {
  const cls = cn(buttonVariants({ variant }), "rounded-full px-6 py-2.5 text-sm", className);
  if (href?.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} target={target} rel={rel}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls}>
      {children}
    </button>
  );
};
