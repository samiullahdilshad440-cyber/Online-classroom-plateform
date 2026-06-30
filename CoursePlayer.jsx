import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProgressRing from '../../components/ProgressRing';

gsap.registerPlugin(ScrollTrigger);

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const modulesRef = useRef([]);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`/api/courses/${id}`);
        setCourse(res.data.data);

        // Get enrollment progress
        const enrollRes = await axios.get('/api/enrollments/my-courses');
        const enrollment = enrollRes.data.data.find(ec => ec.courseId === id);
        if (enrollment) {
          setProgressPercent(enrollment.progressPercent);
        }

        // Set first lesson as active
        const modules = res.data.data.modules.sort((a, b) => a.order - b.order);
        if (modules.length > 0 && modules[0].lessons.length > 0) {
          setActiveLesson(modules[0].lessons[0]);
        }
      } catch (err) {
        console.error('Failed to fetch course:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // GSAP ScrollTrigger for module reveal with lime flash
  useEffect(() => {
    if (course && modulesRef.current.length > 0) {
      modulesRef.current.forEach((el) => {
        if (el) {
          gsap.fromTo(
            el,
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              onEnter: () => {
                // Brief lime flash on the border
                gsap.to(el, {
                  borderColor: 'rgba(210, 255, 0, 0.8)',
                  boxShadow: '0 0 20px rgba(210, 255, 0, 0.2)',
                  duration: 0.3,
                  yoyo: true,
                  repeat: 1,
                  ease: 'power1.inOut',
                });
              },
            }
          );
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [course]);

  // SECRET REQ #2: Optimistic UI for marking lessons complete
  const handleMarkComplete = async () => {
    if (!activeLesson || completedLessons.includes(activeLesson._id)) return;

    // 1. Optimistically update UI instantly (<400ms - Doherty Threshold)
    setCompletedLessons(prev => [...prev, activeLesson._id]);
    setIsCompleting(true);

    // 2. Calculate new progress
    const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    const newCompletedCount = completedLessons.length + 1;
    const newPercent = Math.round((newCompletedCount / totalLessons) * 100);
    setProgressPercent(newPercent);

    // 3. Fire the silent PATCH to the backend
    try {
      await axios.patch(`/api/enrollments/${id}/progress`, { lessonId: activeLesson._id });
    } catch (err) {
      console.error('Progress sync failed, but UI updated:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  // Navigate to next lesson
  const handleNextLesson = () => {
    const modules = course.modules.sort((a, b) => a.order - b.order);
    let foundCurrent = false;

    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (foundCurrent) {
          setActiveLesson(lesson);
          return;
        }
        if (lesson._id === activeLesson._id) {
          foundCurrent = true;
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-accent font-mono text-xl animate-pulse">
          LOADING SECTOR DATA...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-muted font-mono">SECTOR NOT FOUND</div>
      </div>
    );
  }

  const isLessonCompleted = activeLesson && completedLessons.includes(activeLesson._id);
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <Link to="/student/dashboard" className="text-text-muted font-mono text-sm hover:text-accent mb-4 inline-block">
          ← EXIT SECTOR
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl text-text mb-2">{course.title}</h1>
            <p className="text-text-muted font-mono text-sm uppercase tracking-widest">
              // {course.category} • Instructor: {course.instructorName}
            </p>
          </div>
          <ProgressRing progress={progressPercent} size={80} strokeWidth={6} />
        </div>

        {/* Video/Content Display */}
        <div className="w-full aspect-video bg-black rounded-xl border border-border mb-8 flex items-center justify-center overflow-hidden">
          {activeLesson?.type === 'video' && activeLesson.contentUrl ? (
            <video src={activeLesson.contentUrl} controls className="w-full h-full" />
          ) : activeLesson?.type === 'reading' ? (
            <div className="p-8 text-text font-body max-w-2xl">
              <h2 className="font-display text-2xl mb-4">{activeLesson.title}</h2>
              <p className="text-text-muted leading-relaxed">
                Reading content goes here. In a production app, this would render markdown or rich text.
              </p>
            </div>
          ) : (
            <div className="text-text-muted font-mono text-center">
              <div className="text-4xl mb-2">📺</div>
              <p>{activeLesson ? `Content type: ${activeLesson.type.toUpperCase()}` : 'SELECT A LESSON TO BEGIN'}</p>
            </div>
          )}
        </div>

        {/* Lesson Info + Mark Complete */}
        {activeLesson && (
          <div className="p-6 rounded-xl border border-border bg-bg flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl text-text mb-1">{activeLesson.title}</h3>
              <p className="text-text-muted text-sm font-mono">
                Duration: {activeLesson.duration} mins • Type: {activeLesson.type}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMarkComplete}
                disabled={isLessonCompleted || isCompleting}
                className={`px-6 py-3 font-display rounded-lg uppercase tracking-wider transition-all ${
                  isLessonCompleted
                    ? 'bg-accent/20 text-accent cursor-default'
                    : 'bg-accent text-bg hover:shadow-[0_0_15px_rgba(210,255,0,0.3)]'
                }`}
              >
                {isLessonCompleted ? '✓ Sector Cleared' : isCompleting ? 'Syncing...' : 'Mark Complete'}
              </button>
              <button
                onClick={handleNextLesson}
                className="px-6 py-3 border border-border text-text-muted font-display rounded-lg hover:border-accent hover:text-accent transition-all uppercase tracking-wider"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar: Course Curriculum */}
      <div className="w-full lg:w-96 bg-bg border-l border-border p-6 overflow-y-auto max-h-screen sticky top-0">
        <h2 className="font-display text-2xl text-text mb-6 uppercase tracking-tight">
          Telemetry
        </h2>

        <div className="space-y-6">
          {course.modules.sort((a, b) => a.order - b.order).map((module, idx) => (
            <div
              key={module._id}
              ref={el => modulesRef.current[idx] = el}
              className="p-4 rounded-lg border border-border bg-bg"
            >
              <h3 className="font-mono text-accent text-sm uppercase tracking-widest mb-3">
                Sector {module.order}: {module.title}
              </h3>
              <ul className="space-y-2">
                {module.lessons.map(lesson => {
                  const isDone = completedLessons.includes(lesson._id);
                  const isActive = activeLesson?._id === lesson._id;

                  return (
                    <li key={lesson._id}>
                      <button
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full text-left p-3 rounded-md text-sm transition-all flex items-center justify-between group ${
                          isActive
                            ? 'bg-accent/10 border border-accent text-text'
                            : 'bg-transparent border border-transparent text-text-muted hover:border-border hover:text-text'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`font-mono text-xs ${isDone ? 'text-accent' : 'opacity-50'}`}>
                            {isDone ? '✓' : lesson.type === 'video' ? '▶' : '📄'}
                          </span>
                          <span className="line-clamp-1">{lesson.title}</span>
                        </span>
                        <span className="font-mono text-xs opacity-50">{lesson.duration}m</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-8 p-4 border border-border rounded-lg bg-surface backdrop-blur-md">
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-2">
            Overall Progress
          </p>
          <div className="flex items-center gap-3">
            <ProgressRing progress={progressPercent} size={60} strokeWidth={4} />
            <div>
              <p className="font-mono text-2xl font-bold text-accent">{progressPercent}%</p>
              <p className="text-text-muted font-mono text-xs">
                {completedLessons.length} / {totalLessons} lessons
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;