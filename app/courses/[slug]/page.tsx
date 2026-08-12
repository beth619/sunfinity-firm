import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';

// Cache the fetch so generateMetadata and the page component share the result
const getCourse = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, description, category_tag, slug, content_url')
    .eq('slug', slug)
    .maybeSingle();

  return course;
});

const getLessons = cache(async (courseId: number) => {
  const supabase = await createClient();
  // Attempt to fetch from a 'lessons' table gracefully
  let lessons = null;
  let error = null;
  try {
    const res = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    lessons = res.data;
    error = res.error;
  } catch (e) {
    error = true;
  }

  if (error || !lessons) return [];
  return lessons;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  return {
    title: course?.title ? `${course.title} | Courses` : 'Course Not Found',
  };
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const sParams = await searchParams;
  const selectedLessonId = sParams.lesson as string | undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let hasActiveSubscription = false;

  if (user) {
    const { getAppUser } = await import('@/app/utils/get-app-user');
    const appUser = await getAppUser(supabase);

    if (appUser) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', appUser.id)
        .eq('status', 'active')
        .maybeSingle();

      hasActiveSubscription = !!subscription;
    }
  }

  // Gracefully try fetching lessons. If it fails or returns empty, we fall back to content_url.
  const lessons = await getLessons(course.id);
  const useLessonsMode = lessons && lessons.length > 0;

  // Determine which URL to play
  let currentVideoUrl = course.content_url;
  let currentLessonTitle = course.title;
  let currentLessonDesc = course.description;

  if (useLessonsMode) {
    let activeLesson = lessons[0];
    if (selectedLessonId) {
      const found = lessons.find((l: any) => l.id.toString() === selectedLessonId);
      if (found) activeLesson = found;
    }
    currentVideoUrl = activeLesson.video_url || activeLesson.content_url || null;
    currentLessonTitle = activeLesson.title || `Lesson ${activeLesson.order_index || activeLesson.id}`;
    currentLessonDesc = activeLesson.description || '';
  }

  const renderVideoPlayer = (url: string | null | undefined) => {
    if (!url || url.trim() === '') {
      return (
        <div className="aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 p-6 text-center">
          <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-lg text-primary-navy">Content coming soon</span>
          <p className="text-sm mt-2 text-gray-500">We are currently preparing the video for this module.</p>
        </div>
      );
    }

    const tUrl = url.trim();
    if (tUrl.includes('youtube.com') || tUrl.includes('youtu.be')) {
      let videoId = '';
      try {
        if (tUrl.includes('youtu.be/')) {
          videoId = tUrl.split('youtu.be/')[1]?.split('?')[0];
        } else {
          const urlParams = new URL(tUrl).searchParams;
          videoId = urlParams.get('v') || '';
        }
      } catch (e) { }

      return videoId ? (
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-md">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Course Video"
          />
        </div>
      ) : (
        <a href={tUrl} target="_blank" rel="noopener noreferrer" className="text-primary-green font-medium hover:underline break-all">View Content</a>
      );
    } else if (tUrl.includes('vimeo.com')) {
      const parts = tUrl.split('/');
      const videoId = parts[parts.length - 1]?.split('?')[0];

      return videoId ? (
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-md">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="absolute top-0 left-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Course Video"
          />
        </div>
      ) : (
        <a href={tUrl} target="_blank" rel="noopener noreferrer" className="text-primary-green font-medium hover:underline break-all">View Content</a>
      );
    } else if (tUrl.endsWith('.mp4') || tUrl.endsWith('.webm') || tUrl.endsWith('.ogg')) {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-md">
          <video src={tUrl} controls className="absolute top-0 left-0 w-full h-full" />
        </div>
      );
    } else {
      return (
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-start gap-3">
          <p className="text-gray-600">Access the material for this course below:</p>
          <a href={tUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-primary-green hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors break-all">
            View Course Material
          </a>
        </div>
      );
    }
  };

  return (
    <main className="bg-[#F2F2F7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/courses" className="text-sm font-medium text-primary-green hover:underline flex items-center gap-2">
            &larr; Back to Courses
          </Link>
        </div>

        {/* Header Info */}
        <div className="mb-10">
          <span className="inline-block text-xs font-semibold uppercase bg-gray-200 text-gray-700 px-3 py-1 rounded-full mb-4">
            {course.category_tag}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-navy mb-4">
            {course.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            {course.description}
          </p>
        </div>

        {/* Main Layout Area */}
        {hasActiveSubscription ? (
          <div className={`grid grid-cols-1 ${useLessonsMode ? 'lg:grid-cols-3' : ''} gap-8`}>

            {/* Player Column */}
            <div className={`${useLessonsMode ? 'lg:col-span-2' : 'col-span-1 max-w-4xl'} space-y-6`}>
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 border border-gray-200">
                {renderVideoPlayer(currentVideoUrl)}

                {useLessonsMode && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-primary-navy mb-2">{currentLessonTitle}</h2>
                    {currentLessonDesc && <p className="text-gray-600">{currentLessonDesc}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Syllabus Sidebar */}
            {useLessonsMode && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <h3 className="font-bold text-primary-navy">Course Syllabus</h3>
                    <p className="text-xs text-gray-500 mt-1">{lessons.length} Modules</p>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto">
                    {lessons.map((l: any, idx: number) => {
                      const isActive = (selectedLessonId ? l.id.toString() === selectedLessonId : idx === 0);
                      const lessonTitle = l.title || `Lesson ${idx + 1}`;
                      return (
                        <Link
                          key={l.id}
                          href={`/courses/${slug}?lesson=${l.id}`}
                          className={`block px-6 py-4 border-b border-gray-100 transition-colors last:border-b-0 ${isActive ? 'bg-green-50 border-l-4 border-l-primary-green' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${isActive ? 'bg-primary-green text-white' : 'bg-gray-200 text-gray-600'}`}>
                              {idx + 1}
                            </div>
                            <div>
                              <p className={`font-semibold text-sm ${isActive ? 'text-primary-green' : 'text-primary-navy'}`}>
                                {lessonTitle}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 border border-gray-200">
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary-navy mb-4">
                Unlock this course
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto mb-8">
                Subscribe to access this content, along with our entire library of courses, book summaries, and exclusive essays.
              </p>
              <Link
                href="/courses#pricing"
                className="inline-block bg-primary-green hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}