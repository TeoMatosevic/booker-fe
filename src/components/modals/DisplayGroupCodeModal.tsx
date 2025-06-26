import React, { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';

interface DisplayGroupCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    code: string | null;
    groupName: string | null;
}

const DisplayGroupCodeModal: React.FC<DisplayGroupCodeModalProps> = ({ isOpen, onClose, code, groupName }) => {
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState<string | null>(null);

    const handleCopyToClipboard = () => {
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                setCopied(true);
                setCopyError(null);
                setTimeout(() => setCopied(false), 2500);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
                setCopyError('Failed to copy code. Please copy it manually.');
                setCopied(false);
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            setCopied(false);
            setCopyError(null);
        }
    }, [isOpen, code]);


    if (!isOpen || !code || !groupName) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-center">
                <div className="flex justify-end">
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                <h2 className="text-xl font-semibold mb-3">Invite Code Generated!</h2>
                <p className="text-sm text-gray-600 mb-1">
                    Share this code with users you want to invite to the group:
                </p>
                <p className="text-lg font-bold text-indigo-600 mb-4">
                    {groupName}
                </p>

                <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-md border border-gray-300 mb-4">
                    <input
                        type="text"
                        value={code}
                        readOnly
                        className="flex-grow p-2 text-xl sm:text-2xl font-mono tracking-wider border-none bg-transparent focus:ring-0 text-center text-gray-700"
                        aria-label="Group Invite Code"
                    />
                    <button
                        onClick={handleCopyToClipboard}
                        title="Copy to clipboard"
                        className="p-2 text-gray-500 hover:text-indigo-600 focus:outline-none rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        <Copy size={22} />
                    </button>
                </div>

                {copied && <p className="text-green-500 text-sm mb-3">Copied to clipboard!</p>}
                {copyError && <p className="text-red-500 text-sm mb-3">{copyError}</p>}

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default DisplayGroupCodeModal;
