import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '', description: '', category: '', price: 0, modules: [],
  });

  useEffect(() => {
    if (isEditing) {
      const fetchCourse = async () => {
        try {
          const res = await axios.get(`/api/courses/${id}`);
          const c = res.data.data;
          setFormData({ title: c.title, description: c.description, category: c.category, price: c.price, modules: c.modules });
        } catch (err) { console.error(err); }
      };
      fetchCourse();
    }
  }, [id, isEditing]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: '', order: formData.modules.length + 1, lessons: [] }],
    });
  };

  const updateModule = (mIdx, field, value) => {
    const updated = [...formData.modules];
    updated[mIdx][field] = value;
    setFormData({ ...formData, modules: updated });
  };

  const addLesson = (mIdx) => {
    const updated = [...formData.modules];
    updated[mIdx].lessons.push({ title: '', type: 'video', contentUrl: '', duration: 0 });
    setFormData({ ...formData, modules: updated });
  };

  const updateLesson = (mIdx, lIdx, field, value) => {
    const updated = [...formData.modules];
    updated[mIdx].lessons[lIdx][field] = value;
    setFormData({ ...formData, modules: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await axios.put(`/api/courses/${id}`, formData);
      else await axios.post('/api/courses', formData);
      navigate('/teacher/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save course');
    }
  };

  return (
    <div className="min-h-screen bg-bg p-8 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl text-text mb-1">{isEditing ? 'EDIT COURSE' : 'BUILD COURSE'}</h1>
      <p className="text-text-muted font-mono text-xs mb-8 uppercase tracking-widest">
        // {isEditing ? 'Modifying existing telemetry' : 'Initialize new sector'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 01. General Parameters (Quiet UI) */}
        <div className="space-y-4 p-6 border border-border rounded-lg bg-bg">
          <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-border pb-2">01. General Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Category</label>
              <input type="text" name="category" required value={formData.category} onChange={handleChange} className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Price</label>
              <input type="number" name="price" min="0" value={formData.price} onChange={handleChange} className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Description</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
        </div>

        {/* 02. Curriculum Structure */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-mono text-accent text-sm uppercase tracking-widest">02. Curriculum Structure</h2>
            <button type="button" onClick={addModule} className="px-4 py-2 border border-accent text-accent font-mono text-xs rounded hover:bg-accent hover:text-bg transition-colors uppercase">+ Add Sector</button>
          </div>

          {formData.modules.map((module, mIdx) => (
            <div key={mIdx} className="p-4 border border-border rounded-lg bg-bg space-y-4">
              <div className="flex gap-4 items-center">
                <span className="font-mono text-text-muted text-xs">SECTOR {module.order}</span>
                <input type="text" placeholder="Module Title" value={module.title} onChange={(e) => updateModule(mIdx, 'title', e.target.value)} className="flex-1 bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent" />
              </div>

              <div className="pl-8 space-y-3 border-l-2 border-border/50 ml-2">
                {module.lessons.map((lesson, lIdx) => (
                  <div key={lIdx} className="flex gap-2 items-center text-xs">
                    <input type="text" placeholder="Lesson Title" value={lesson.title} onChange={(e) => updateLesson(mIdx, lIdx, 'title', e.target.value)} className="flex-1 bg-bg border border-border rounded px-2 py-1 text-text font-mono focus:outline-none focus:border-accent" />
                    <select value={lesson.type} onChange={(e) => updateLesson(mIdx, lIdx, 'type', e.target.value)} className="bg-bg border border-border rounded px-2 py-1 text-text font-mono focus:outline-none focus:border-accent">
                      <option value="video">Video</option>
                      <option value="reading">Reading</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                    </select>
                    <input type="number" placeholder="Min" min="0" value={lesson.duration} onChange={(e) => updateLesson(mIdx, lIdx, 'duration', parseInt(e.target.value) || 0)} className="w-16 bg-bg border border-border rounded px-2 py-1 text-text font-mono focus:outline-none focus:border-accent" />
                  </div>
                ))}
                <button type="button" onClick={() => addLesson(mIdx)} className="text-text-muted font-mono text-xs hover:text-accent transition-colors uppercase">+ Add Lesson</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="px-8 py-3 bg-accent text-bg font-display rounded hover:shadow-[0_0_15px_rgba(210,255,0,0.3)] transition-all uppercase tracking-wider">
            {isEditing ? 'Save Changes' : 'Deploy Course'}
          </button>
          <button type="button" onClick={() => navigate('/teacher/dashboard')} className="px-8 py-3 border border-border text-text-muted font-display rounded hover:border-text-muted hover:text-text transition-all uppercase tracking-wider">
            Abort
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseBuilder;