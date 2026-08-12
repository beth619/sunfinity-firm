'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Filter constants matching your public catalog pages
const RESOURCE_CATEGORIES = ['Startups', 'Scaling', 'Leadership', 'Toolkits', 'Woman in Business', 'MENA Stories'];
const RESOURCE_TYPES = ['PDF', 'Template', 'Checklist', 'Video', 'Case Study', 'Framework'];
const BOOK_TOPICS = ['Startups', 'Scaling', 'Leadership', 'Essays'];
const BOOK_FORMATS = ['eBook', 'Physical', 'Bundle'];

interface Article {
    id: number;
    title: string;
    published_at: string;
    category_tag: string;
    content: { body?: string };
}

interface BookRow {
    id: number;
    title: string;
    author: string;
    created_at: string;
    topic?: string;
    format?: string;
}

interface ResourceRow {
    id: number;
    title: string;
    description?: string;
    category: string;
    file_type: string;
    is_gated: boolean;
    img_url?: string;
    file_url: string;
    date: string;
    slug: string;
    created_at: string;
}

interface CampaignRow {
    id: number;
    subject: string;
    preview_text: string;
    body_content: string;
    status: string;
    sent_at?: string;
    created_at: string;
}

export default function AdminCMSPage() {
    const [activeTab, setActiveTab] = useState<'essays' | 'books' | 'resources' | 'emails'>('essays');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const showError = (msg: string) => {
        setErrorMsg(msg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setErrorMsg(null), 6000);
    };

    // ==========================================
    // 1. ESSAY STATES
    // ==========================================
    const [title, setTitle] = useState('');
    const [articleExcerpt, setArticleExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [publishedSuccess, setPublishedSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [fetchingArticles, setFetchingArticles] = useState(false);

    // ==========================================
    // 2. BOOK STATES (lowercase 'books' table)
    // ==========================================
    const [bookTitle, setBookTitle] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [bookDescription, setBookDescription] = useState('');
    const [bookPrice, setBookPrice] = useState('');
    const [bookAmazonUrl, setBookAmazonUrl] = useState('');
    const [bookTopic, setBookTopic] = useState('Startups');
    const [bookFormat, setBookFormat] = useState('eBook');
    const [bookCoverFile, setBookCoverFile] = useState<File | null>(null);
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [bookSuccess, setBookSuccess] = useState(false);
    const [bookLoading, setBookLoading] = useState(false);
    const [books, setBooks] = useState<BookRow[]>([]);
    const [fetchingBooks, setFetchingBooks] = useState(false);

    // ==========================================
    // 3. RESOURCE STATES ('resources' table)
    // ==========================================
    const [resTitle, setResTitle] = useState('');
    const [resDescription, setResDescription] = useState('');
    const [resCategory, setResCategory] = useState(RESOURCE_CATEGORIES[0]);
    const [resFileType, setResFileType] = useState(RESOURCE_TYPES[0]);
    const [resIsGated, setResIsGated] = useState(false);
    const [resImgFile, setResImgFile] = useState<File | null>(null);
    const [resFile, setResFile] = useState<File | null>(null);
    const [resSuccess, setResSuccess] = useState(false);
    const [resLoading, setResLoading] = useState(false);
    const [resources, setResources] = useState<ResourceRow[]>([]);
    const [fetchingResources, setFetchingResources] = useState(false);

    // ==========================================
    // 4. EMAIL CAMPAIGN STATES ('campaigns' table)
    // ==========================================
    const [emailSubject, setEmailSubject] = useState('');
    const [emailPreviewText, setEmailPreviewText] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
    const [fetchingCampaigns, setFetchingCampaigns] = useState(false);

    // ==========================================
    // FETCH DATA ON TAB SWITCH
    // ==========================================
    useEffect(() => {
        if (activeTab === 'essays') fetchArticles();
        if (activeTab === 'books') fetchBooks();
        if (activeTab === 'resources') fetchResources();
        if (activeTab === 'emails') fetchCampaigns();
    }, [activeTab]);

    const fetchArticles = async () => {
        setFetchingArticles(true);
        const { data, error } = await supabase
            .from('Articles')
            .select('id, title, published_at, category_tag, content')
            .order('published_at', { ascending: false });

        if (!error && data) setArticles(data);
        setFetchingArticles(false);
    };

    const fetchBooks = async () => {
        setFetchingBooks(true);
        const { data, error } = await supabase
            .from('books')
            .select('id, title, author, created_at, topic, format')
            .order('created_at', { ascending: false });

        if (!error && data) setBooks(data);
        setFetchingBooks(false);
    };

    const fetchResources = async () => {
        setFetchingResources(true);
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setResources(data);
        setFetchingResources(false);
    };

    const fetchCampaigns = async () => {
        setFetchingCampaigns(true);
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setCampaigns(data);
        setFetchingCampaigns(false);
    };

    // ==========================================
    // ESSAY HANDLERS
    // ==========================================
    const handlePublishEssay = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImgUrl = '';
            if (imageFile) {
                const fileName = `${Date.now()}-${imageFile.name}`;
                const { error: uploadError } = await supabase.storage.from('article-covers').upload(fileName, imageFile);
                if (uploadError) throw uploadError;
                const { data: publicURLData } = supabase.storage.from('article-covers').getPublicUrl(fileName);
                finalImgUrl = publicURLData.publicUrl;
            }

            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const jsonContent = { body: content };

            if (editingId !== null) {
                const updateData: any = { title, content: jsonContent, description: articleExcerpt, slug };
                if (finalImgUrl) updateData.img_url = finalImgUrl;
                const { error } = await supabase.from('Articles').update(updateData).eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('Articles').insert([
                    {
                        title,
                        content: jsonContent,
                        description: articleExcerpt,

                        category_tag: 'Essays',
                        slug,
                        published_at: new Date().toISOString(),
                        author_name: 'Betelhem',
                        author_role: 'Software Engineer',
                        img_url: finalImgUrl,
                    },
                ]);
                if (error) throw error;
            }

            setPublishedSuccess(true);
            setTitle('');
            setArticleExcerpt('');
            setContent('');
            setImageFile(null);
            setEditingId(null);
            fetchArticles();
            setTimeout(() => setPublishedSuccess(false), 4000);
        } catch (error: any) {
            showError('Error saving essay: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (art: Article) => {
        setEditingId(art.id);
        setTitle(art.title);
        setContent(art.content?.body || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setArticleExcerpt('');
        setContent('');
        setImageFile(null);
    };

    const handleDeleteArticle = async (id: number) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            const { error } = await supabase.from('Articles').delete().eq('id', id);
            if (error) throw error;
            setArticles(articles.filter((art) => art.id !== id));
            if (editingId === id) handleCancelEdit();
        } catch (error: any) {
            showError('Error deleting article: ' + error.message);
        }
    };

    // ==========================================
    // BOOK HANDLERS
    // ==========================================
    const handlePublishBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookLoading(true);

        try {
            let coverUrl = '';
            let fileUrl = '';

            if (bookCoverFile) {
                const coverName = `cover-${Date.now()}-${bookCoverFile.name}`;
                const { error: coverError } = await supabase.storage.from('article-covers').upload(coverName, bookCoverFile);
                if (coverError) throw coverError;
                const { data } = supabase.storage.from('article-covers').getPublicUrl(coverName);
                coverUrl = data.publicUrl;
            }

            if (bookFile) {
                const fileName = `book-${Date.now()}-${bookFile.name}`;
                const { error: fileError } = await supabase.storage.from('article-covers').upload(fileName, bookFile);
                if (fileError) throw fileError;
                const { data } = supabase.storage.from('article-covers').getPublicUrl(fileName);
                fileUrl = data.publicUrl;
            }

            const slug = bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const { error } = await supabase.from('books').insert([
                {
                    title: bookTitle,
                    author: bookAuthor,
                    description: bookDescription,
                    price: Number(bookPrice),
                    amazon_url: bookAmazonUrl,
                    cover_image_url: coverUrl,
                    file_url: fileUrl,
                    topic: bookTopic,
                    format: bookFormat,
                    slug,
                    direct_buy_enabled: true,
                    created_at: new Date().toISOString(),
                },
            ]);

            if (error) throw error;

            setBookSuccess(true);
            setBookTitle('');
            setBookAuthor('');
            setBookDescription('');
            setBookPrice('');
            setBookAmazonUrl('');
            setBookCoverFile(null);
            setBookFile(null);
            fetchBooks();
            setTimeout(() => setBookSuccess(false), 4000);
        } catch (error: any) {
            showError('Error saving book: ' + error.message);
        } finally {
            setBookLoading(false);
        }
    };

    const handleDeleteBook = async (id: number) => {
        if (!confirm('Are you sure you want to delete this book?')) return;
        try {
            const { error } = await supabase.from('books').delete().eq('id', id);
            if (error) throw error;
            setBooks(books.filter((b) => b.id !== id));
        } catch (error: any) {
            showError('Error deleting book: ' + error.message);
        }
    };

    // ==========================================
    // RESOURCE HANDLERS
    // ==========================================
    const handlePublishResource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resFile) return showError('Please select a downloadable resource file.');
        setResLoading(true);

        try {
            let imgUrl = '';
            let fileUrl = '';

            if (resImgFile) {
                const imgName = `res-img-${Date.now()}-${resImgFile.name}`;
                const { error: imgErr } = await supabase.storage.from('article-covers').upload(imgName, resImgFile);
                if (imgErr) throw imgErr;
                const { data } = supabase.storage.from('article-covers').getPublicUrl(imgName);
                imgUrl = data.publicUrl;
            }

            const fileName = `res-file-${Date.now()}-${resFile.name}`;
            const { error: fileErr } = await supabase.storage.from('article-covers').upload(fileName, resFile);
            if (fileErr) throw fileErr;
            const { data: fileData } = supabase.storage.from('article-covers').getPublicUrl(fileName);
            fileUrl = fileData.publicUrl;

            const slug = resTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const { error } = await supabase.from('resources').insert([
                {
                    title: resTitle,
                    description: resDescription,
                    category: resCategory,
                    file_type: resFileType,
                    is_gated: resIsGated,
                    img_url: imgUrl,
                    file_url: fileUrl,
                    slug: slug,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    created_at: new Date().toISOString(),
                },
            ]);

            if (error) throw error;

            setResSuccess(true);
            setResTitle('');
            setResDescription('');
            setResImgFile(null);
            setResFile(null);
            setResIsGated(false);
            fetchResources();
            setTimeout(() => setResSuccess(false), 4000);
        } catch (err: any) {
            showError('Error uploading resource: ' + err.message);
        } finally {
            setResLoading(false);
        }
    };

    const handleDeleteResource = async (id: number) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;
        try {
            const { error } = await supabase.from('resources').delete().eq('id', id);
            if (error) throw error;
            setResources(resources.filter((r) => r.id !== id));
        } catch (err: any) {
            showError('Error deleting resource: ' + err.message);
        }
    };

    // ==========================================
    // EMAIL CAMPAIGN HANDLERS
    // ==========================================
    const handleSaveCampaign = async (e: React.FormEvent, status: 'Draft' | 'Sent') => {
        e.preventDefault();
        setEmailLoading(true);

        try {
            // If status is Sent, call our backend API to handle fetching subscribers & emailing via Resend
            if (status === 'Sent') {
                const response = await fetch('/api/send-campaign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: emailSubject,
                        previewText: emailPreviewText,
                        bodyContent: emailBody,
                    }),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to dispatch emails via Resend.');
                }
            }

            // Save the campaign record in Supabase
            const { error } = await supabase.from('campaigns').insert([
                {
                    subject: emailSubject,
                    preview_text: emailPreviewText,
                    body_content: emailBody,
                    status: status,
                    sent_at: status === 'Sent' ? new Date().toISOString() : null,
                    created_at: new Date().toISOString(),
                },
            ]);

            if (error) throw error;

            setEmailSuccess(true);
            setEmailSubject('');
            setEmailPreviewText('');
            setEmailBody('');
            fetchCampaigns();
            setTimeout(() => setEmailSuccess(false), 4000);
        } catch (err: any) {
            showError('Error saving/sending campaign: ' + err.message);
        } finally {
            setEmailLoading(false);
        }
    };

    const handleDeleteCampaign = async (id: number) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        try {
            const { error } = await supabase.from('campaigns').delete().eq('id', id);
            if (error) throw error;
            setCampaigns(campaigns.filter((c) => c.id !== id));
        } catch (err: any) {
            showError('Error deleting campaign: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Header */}
            <header className="bg-primary-navy text-white px-8 py-4 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-3">
                    <span className="bg-primary-green text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Admin CMS
                    </span>
                    <h1 className="text-lg font-bold">SunFinity Content Management</h1>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    <form action="/api/signout" method="POST">
                        <button type="submit" className="text-gray-300 hover:text-white underline text-xs">
                            Sign Out
                        </button>
                    </form>
                    <Link href="/" className="text-white hover:text-primary-green underline text-xs">
                        View Live Site
                    </Link>
                </div>
            </header>

            {/* Main Container */}
            <div className="flex-1 flex max-w-7xl w-full mx-auto">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 p-6 space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Management</p>
                    <button
                        onClick={() => setActiveTab('essays')}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'essays' ? 'bg-primary-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Weekly Essays
                    </button>
                    <button
                        onClick={() => setActiveTab('books')}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'books' ? 'bg-primary-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Books & Covers
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'resources' ? 'bg-primary-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Resource Files
                    </button>
                    <button
                        onClick={() => setActiveTab('emails')}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'emails' ? 'bg-primary-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Email Campaigns
                    </button>
                </aside>

                {/* Dynamic Content Panel */}
                <main className="flex-1 p-8 space-y-8">
                    {errorMsg && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
                            <span>{errorMsg}</span>
                            <button onClick={() => setErrorMsg(null)} className="font-bold text-lg hover:text-red-900">&times;</button>
                        </div>
                    )}
                    {/* TAB 1: ESSAYS */}
                    {activeTab === 'essays' && (
                        <>
                            {publishedSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                                    <span>{editingId ? 'Article successfully updated!' : 'Essay successfully published!'}</span>
                                    <span className="font-bold">&times;</span>
                                </div>
                            )}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-xl font-bold text-primary-navy">
                                            {editingId ? 'Edit Article' : 'Publish Weekly Essay'}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">Create, edit, and preview essays effortlessly.</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {editingId && (
                                            <button onClick={handleCancelEdit} className="px-4 py-2 text-xs font-semibold border rounded-xl hover:bg-gray-50">
                                                Cancel Edit
                                            </button>
                                        )}
                                        <button onClick={() => setPreviewMode(!previewMode)} className="px-4 py-2 text-xs font-semibold border rounded-xl hover:bg-gray-50">
                                            {previewMode ? 'Edit Mode' : 'Preview Mode'}
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handlePublishEssay} className="space-y-6">
                                    {!previewMode ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Essay Title</label>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="e.g., Building Resilient Systems"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Short Excerpt</label>
                                                <textarea
                                                    rows={2}
                                                    value={articleExcerpt}
                                                    onChange={(e) => setArticleExcerpt(e.target.value)}
                                                    placeholder="A brief summary of the essay..."
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Cover Image File</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-green-600 cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Content Body</label>
                                                <textarea
                                                    rows={6}
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    placeholder="Write your essay content here..."
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                                    required
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-gray-50 p-6 rounded-xl border min-h-[200px]">
                                            <span className="text-xs text-primary-green font-semibold uppercase">Live Preview</span>
                                            <h3 className="text-2xl font-bold text-primary-navy mt-2">{title || 'Untitled'}</h3>
                                            <div className="mt-4 text-gray-700 whitespace-pre-wrap text-sm">{content || 'Nothing to preview.'}</div>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={loading} className="px-6 py-3 bg-primary-green text-white font-medium rounded-xl text-sm hover:bg-green-600 disabled:opacity-50">
                                            {loading ? 'Saving...' : editingId ? 'Update Article' : 'Publish Now'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-lg font-bold text-primary-navy mb-4">Manage Published Essays</h3>
                                {fetchingArticles ? (
                                    <p className="text-sm text-gray-500">Loading essays...</p>
                                ) : articles.length === 0 ? (
                                    <p className="text-sm text-gray-500">No essays found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {articles.map((art) => (
                                            <div key={art.id} className="flex justify-between items-center p-4 rounded-xl border bg-gray-50/50">
                                                <div>
                                                    <h4 className="font-semibold text-primary-navy text-sm">{art.title}</h4>
                                                    <span className="text-xs text-gray-400">Published on {new Date(art.published_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleEditClick(art)} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100">Edit</button>
                                                    <button onClick={() => handleDeleteArticle(art.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100">Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* TAB 2: BOOKS & COVERS */}
                    {activeTab === 'books' && (
                        <>
                            {bookSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
                                    Book and files successfully uploaded to catalog!
                                </div>
                            )}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <div className="mb-6 pb-4 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-primary-navy">Upload New Book & Cover</h2>
                                    <p className="text-xs text-gray-500 mt-1">Add book metadata, cover graphics, and downloadable files.</p>
                                </div>

                                <form onSubmit={handlePublishBook} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Book Title</label>
                                        <input
                                            type="text"
                                            value={bookTitle}
                                            onChange={(e) => setBookTitle(e.target.value)}
                                            placeholder="e.g., Founders at Work"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Author Name</label>
                                        <input
                                            type="text"
                                            value={bookAuthor}
                                            onChange={(e) => setBookAuthor(e.target.value)}
                                            placeholder="e.g., Jessica Livingston"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Book Description</label>
                                        <textarea
                                            rows={3}
                                            value={bookDescription}
                                            onChange={(e) => setBookDescription(e.target.value)}
                                            placeholder="Description of the book..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Price ($)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={bookPrice}
                                                onChange={(e) => setBookPrice(e.target.value)}
                                                placeholder="e.g., 29.99"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Amazon URL</label>
                                            <input
                                                type="url"
                                                value={bookAmazonUrl}
                                                onChange={(e) => setBookAmazonUrl(e.target.value)}
                                                placeholder="https://amazon.com/..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Topic Tag</label>
                                            <select
                                                value={bookTopic}
                                                onChange={(e) => setBookTopic(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary-green"
                                            >
                                                {BOOK_TOPICS.map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Format</label>
                                            <select
                                                value={bookFormat}
                                                onChange={(e) => setBookFormat(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary-green"
                                            >
                                                {BOOK_FORMATS.map((f) => (
                                                    <option key={f} value={f}>{f}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Book Cover Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setBookCoverFile(e.target.files?.[0] || null)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-green-600 cursor-pointer"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Downloadable Book File (PDF / EPUB)</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.epub"
                                            onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-green-600 cursor-pointer"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={bookLoading} className="px-6 py-3 bg-primary-green text-white font-medium rounded-xl text-sm hover:bg-green-600 disabled:opacity-50">
                                            {bookLoading ? 'Uploading...' : 'Save Book & Files'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-lg font-bold text-primary-navy mb-4">Manage Catalog Books</h3>
                                {fetchingBooks ? (
                                    <p className="text-sm text-gray-500">Loading books...</p>
                                ) : books.length === 0 ? (
                                    <p className="text-sm text-gray-500">No books uploaded yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {books.map((b) => (
                                            <div key={b.id} className="flex justify-between items-center p-4 rounded-xl border bg-gray-50/50">
                                                <div>
                                                    <h4 className="font-semibold text-primary-navy text-sm">{b.title}</h4>
                                                    <span className="text-xs text-gray-500">By {b.author} &bull; {b.topic} &bull; {b.format}</span>
                                                </div>
                                                <button onClick={() => handleDeleteBook(b.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100">
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* TAB 3: RESOURCE FILES */}
                    {activeTab === 'resources' && (
                        <>
                            {resSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
                                    Resource successfully uploaded to library!
                                </div>
                            )}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <div className="mb-6 pb-4 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-primary-navy">Upload Resource File</h2>
                                    <p className="text-xs text-gray-500 mt-1">Upload frameworks, templates, checklists, and downloadable files.</p>
                                </div>

                                <form onSubmit={handlePublishResource} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Resource Title</label>
                                        <input
                                            type="text"
                                            value={resTitle}
                                            onChange={(e) => setResTitle(e.target.value)}
                                            placeholder="e.g., Ultimate Startup Pitch Deck Template"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                                        <textarea
                                            rows={3}
                                            value={resDescription}
                                            onChange={(e) => setResDescription(e.target.value)}
                                            placeholder="Short summary of this downloadable resource..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Category</label>
                                            <select
                                                value={resCategory}
                                                onChange={(e) => setResCategory(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary-green"
                                            >
                                                {RESOURCE_CATEGORIES.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">File Type</label>
                                            <select
                                                value={resFileType}
                                                onChange={(e) => setResFileType(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary-green"
                                            >
                                                {RESOURCE_TYPES.map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <input
                                            type="checkbox"
                                            id="gatedCheck"
                                            checked={resIsGated}
                                            onChange={(e) => setResIsGated(e.target.checked)}
                                            className="w-4 h-4 text-primary-green rounded border-gray-300 focus:ring-primary-green"
                                        />
                                        <label htmlFor="gatedCheck" className="text-sm font-medium text-gray-700 cursor-pointer">
                                            Gated Resource (Requires user login or email subscription to download)
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Cover Image (Optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setResImgFile(e.target.files?.[0] || null)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-green-600 cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Downloadable Resource File (PDF, DOCX, ZIP, etc.)</label>
                                        <input
                                            type="file"
                                            onChange={(e) => setResFile(e.target.files?.[0] || null)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-green-600 cursor-pointer"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={resLoading} className="px-6 py-3 bg-primary-green text-white font-medium rounded-xl text-sm hover:bg-green-600 disabled:opacity-50">
                                            {resLoading ? 'Uploading Resource...' : 'Save Resource'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-lg font-bold text-primary-navy mb-4">Manage Downloadable Resources</h3>
                                {fetchingResources ? (
                                    <p className="text-sm text-gray-500">Loading resources...</p>
                                ) : resources.length === 0 ? (
                                    <p className="text-sm text-gray-500">No resources uploaded yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {resources.map((r) => (
                                            <div key={r.id} className="flex justify-between items-center p-4 rounded-xl border bg-gray-50/50">
                                                <div>
                                                    <h4 className="font-semibold text-primary-navy text-sm">{r.title}</h4>
                                                    <span className="text-xs text-gray-500">
                                                        {r.category} &bull; {r.file_type} &bull; {r.is_gated ? '🔒 Gated' : '🔓 Free'}
                                                    </span>
                                                </div>
                                                <button onClick={() => handleDeleteResource(r.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100">
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* TAB 4: EMAIL CAMPAIGNS */}
                    {activeTab === 'emails' && (
                        <>
                            {emailSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
                                    Email campaign saved successfully!
                                </div>
                            )}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <div className="mb-6 pb-4 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-primary-navy">Draft Email Campaign</h2>
                                    <p className="text-xs text-gray-500 mt-1">Compose newsletters and broadcast updates to your subscribers.</p>
                                </div>

                                <form className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Subject Line</label>
                                        <input
                                            type="text"
                                            value={emailSubject}
                                            onChange={(e) => setEmailSubject(e.target.value)}
                                            placeholder="e.g., Weekly Insights: Building Resilient Systems"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Preview Text / Subtitle</label>
                                        <input
                                            type="text"
                                            value={emailPreviewText}
                                            onChange={(e) => setEmailPreviewText(e.target.value)}
                                            placeholder="A short summary snippet shown in the inbox inbox view..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Email Body Content</label>
                                        <textarea
                                            rows={6}
                                            value={emailBody}
                                            onChange={(e) => setEmailBody(e.target.value)}
                                            placeholder="Write your email newsletter content here..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            disabled={emailLoading}
                                            onClick={(e) => handleSaveCampaign(e, 'Draft')}
                                            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-300 disabled:opacity-50"
                                        >
                                            Save as Draft
                                        </button>
                                        <button
                                            type="button"
                                            disabled={emailLoading}
                                            onClick={(e) => handleSaveCampaign(e, 'Sent')}
                                            className="px-6 py-3 bg-primary-green text-white font-medium rounded-xl text-sm hover:bg-green-600 disabled:opacity-50"
                                        >
                                            {emailLoading ? 'Sending...' : 'Dispatch Broadcast'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-lg font-bold text-primary-navy mb-4">Manage Email Campaigns</h3>
                                {fetchingCampaigns ? (
                                    <p className="text-sm text-gray-500">Loading campaigns...</p>
                                ) : campaigns.length === 0 ? (
                                    <p className="text-sm text-gray-500">No email campaigns created yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {campaigns.map((c) => (
                                            <div key={c.id} className="flex justify-between items-center p-4 rounded-xl border bg-gray-50/50">
                                                <div>
                                                    <h4 className="font-semibold text-primary-navy text-sm">{c.subject}</h4>
                                                    <span className="text-xs text-gray-500">
                                                        Status: <span className={c.status === 'Sent' ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'}>{c.status}</span> &bull; Created: {new Date(c.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <button onClick={() => handleDeleteCampaign(c.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100">
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}