'use client'
import CourseCard from '@/app/components/CourseCard/CourseCard';

interface Course {
    slug: string;
    thumbnail_url?: string;
    category_tag: string;
    title: string;
    description: string;
}

interface CoursesGridProps {

    courses: Course[];
    hasActiveSubscription: boolean;

}
export default function CoursesGrid({ courses, hasActiveSubscription }: CoursesGridProps) {
    const scrollToPricing = () => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
                <CourseCard
                    key={course.slug}
                    thumbnailUrl={course.thumbnail_url}
                    categoryTag={course.category_tag}
                    title={course.title}
                    description={course.description}
                    status={hasActiveSubscription ? 'unlocked' : 'locked'}
                    slug={course.slug}
                    onSubscribeClick={scrollToPricing}
                />
            ))}
        </div>
    );
}