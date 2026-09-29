import { redirect } from 'next/navigation';

export default function TvPage() {
  redirect('/browse?type=tv');
}
