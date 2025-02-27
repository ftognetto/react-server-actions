import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Button asChild>
        <Link href="/html-form">HTML Form</Link>
      </Button>
      <Button asChild>
        <Link href="/shadcn-form">Shadcn Form</Link>
      </Button>
    </>
  );
}
