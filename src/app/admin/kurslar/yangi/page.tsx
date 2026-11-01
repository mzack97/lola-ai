import { AdminHead, Back, Flash } from "@/components/AdminUi";
import { CourseForm } from "@/components/CourseForm";

export default async function NewCourse({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  return (<div><Back href="/admin/kurslar" label="Kurslar" /><AdminHead title="Yangi kurs" /><Flash sp={await searchParams} /><CourseForm /></div>);
}
