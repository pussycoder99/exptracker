import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="text-2xl font-bold font-headline text-primary hover:text-accent transition-colors">
      SNBD<span className="text-foreground">Expense</span>
    </Link>
  );
};

export default Logo;
