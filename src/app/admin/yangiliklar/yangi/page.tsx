import { AdminHead, Back, Flash } from "@/components/AdminUi";
import { NewsForm } from "@/components/NewsForm";

export default async function NewNews({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  return (<div><Back href="/admin/yangiliklar" label="Yangiliklar" /><AdminHead title="Yangi xabar" /><Flash sp={await searchParams} /><NewsForm /></div>);
}
