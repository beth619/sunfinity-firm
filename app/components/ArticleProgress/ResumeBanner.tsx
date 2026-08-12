'use client';

export default function ResumeBanner({ percent }: { percent: number }) {
    const handleJump = () => {
        const target = (percent / 100) * (document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: target, behavior: 'smooth' });
    };

    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary-green/30 bg-primary-green/5 px-5 py-4 mb-6">
            <p className="text-sm text-primary-navy">
                You're <span className="font-semibold">{percent}%</span> through this article — pick up where you left off?
            </p>
            <button
                type="button"
                onClick={handleJump}
                className="flex-shrink-0 rounded-full bg-primary-navy px-4 py-2 text-xs font-semibold text-white hover:bg-primary-green transition-colors"
            >
                Jump back in
            </button>
        </div>
    );
}