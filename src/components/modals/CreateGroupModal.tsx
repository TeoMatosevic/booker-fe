import React, { useState } from 'react';
import apiClient from '../../api';
import { Modal, Input, Button, Alert } from '../ui';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupCreated: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) {
            setError("Group name cannot be empty.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post('/groups/', { name: groupName });
            setGroupName('');
            onGroupCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to create group');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setGroupName('');
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Group" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <Alert
                        variant="error"
                        message={error}
                        onDismiss={() => setError(null)}
                    />
                )}

                <Input
                    label="Group Name"
                    type="text"
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    required
                    autoFocus
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        onClick={handleClose}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        variant="primary"
                    >
                        Create Group
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGroupModal;
