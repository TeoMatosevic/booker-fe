import React, { useState, useEffect } from 'react';
import apiClient from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { Modal, Input, Button, Alert } from '../ui';

interface JoinGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupJoined: () => void;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose, onGroupJoined }) => {
    const [groupCode, setGroupCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setGroupCode('');
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupCode.trim()) {
            setError("Please enter a group code.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post(`/groups/join/${groupCode.trim()}`);
            const joinedGroupName = response.data?.name || "the group";

            showToast('success', `Successfully joined ${joinedGroupName}!`);
            onGroupJoined();
            setGroupCode('');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to join group. Invalid or expired code.');
            console.error("Join group error:", err.response || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setGroupCode('');
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Join a Group" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <Alert
                        variant="error"
                        message={error}
                        onDismiss={() => setError(null)}
                    />
                )}

                <Input
                    label="Enter Group Code"
                    type="text"
                    id="groupCode"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    placeholder="e.g., ABC-123"
                    className="text-center tracking-wider"
                    required
                    autoFocus
                    disabled={isLoading}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        onClick={handleClose}
                        variant="secondary"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        variant="primary"
                    >
                        Join Group
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default JoinGroupModal;
