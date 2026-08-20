import { FaXmark } from "react-icons/fa6";

const Modal = ({ open, title, children, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl">
                <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold tracking-tight text-slate-950">
                            {title}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Complete the details below.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close"
                    >
                        <FaXmark className="size-4" />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;